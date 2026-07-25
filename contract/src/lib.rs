#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

const POLL_KEY: Symbol = symbol_short!("POLLS");
const NEXT_ID_KEY: Symbol = symbol_short!("NEXT_ID");

#[derive(Clone)]
#[contracttype]
pub struct Poll {
    pub id: u32,
    pub question: soroban_sdk::String,
    pub options: soroban_sdk::Vec<soroban_sdk::String>,
    pub votes: soroban_sdk::Vec<u32>,
    pub creator: Address,
    pub total_votes: u32,
    pub active: bool,
}

#[derive(Clone)]
#[contracttype]
pub enum PollEntry {
    Poll(Poll),
}

#[contract]
pub struct LivePoll;

#[contractimpl]
impl LivePoll {
    pub fn initialize(env: Env) {
        if env.storage().instance().has(&NEXT_ID_KEY) {
            panic!("already initialized");
        }
        env.storage().instance().set(&NEXT_ID_KEY, &0u32);
    }

    pub fn create_poll(
        env: Env,
        creator: Address,
        question: soroban_sdk::String,
        options: soroban_sdk::Vec<soroban_sdk::String>,
    ) -> u32 {
        creator.require_auth();

        if options.len() < 2 || options.len() > 10 {
            panic!("poll must have 2-10 options");
        }

        let poll_id: u32 = env.storage().instance().get(&NEXT_ID_KEY).unwrap_or(0);
        let mut vote_counts = soroban_sdk::Vec::new(&env);
        for _ in 0..options.len() {
            vote_counts.push_back(0u32);
        }

        let poll = Poll {
            id: poll_id,
            question,
            options,
            votes: vote_counts,
            creator: creator.clone(),
            total_votes: 0,
            active: true,
        };

        let key = symbol_short!("POLL");
        let poll_key = (&key, poll_id);
        env.storage().persistent().set(&poll_key, &poll);
        env.storage()
            .instance()
            .set(&NEXT_ID_KEY, &(poll_id + 1));

        env.events().publish(
            (symbol_short!("CREATE"),),
            (poll_id, creator),
        );

        poll_id
    }

    pub fn vote(env: Env, voter: Address, poll_id: u32, option_index: u32) {
        voter.require_auth();

        let key = symbol_short!("POLL");
        let poll_key = (&key, poll_id);
        let mut poll: Poll = env
            .storage()
            .persistent()
            .get(&poll_key)
            .expect("poll not found");

        if !poll.active {
            panic!("poll is closed");
        }

        if option_index >= poll.options.len() {
            panic!("invalid option index");
        }

        let voted_key = (symbol_short!("VOTED"), poll_id, voter.clone());
        if env.storage().persistent().has(&voted_key) {
            panic!("already voted");
        }

        let current = poll.votes.get_unchecked(option_index);
        poll.votes.set(option_index, current + 1);
        poll.total_votes += 1;

        env.storage().persistent().set(&poll_key, &poll);
        env.storage().persistent().set(&voted_key, &true);

        env.events().publish(
            (symbol_short!("VOTE"),),
            (poll_id, voter, option_index),
        );
    }

    pub fn close_poll(env: Env, caller: Address, poll_id: u32) {
        caller.require_auth();

        let key = symbol_short!("POLL");
        let poll_key = (&key, poll_id);
        let mut poll: Poll = env
            .storage()
            .persistent()
            .get(&poll_key)
            .expect("poll not found");

        if poll.creator != caller {
            panic!("only creator can close poll");
        }

        poll.active = false;
        env.storage().persistent().set(&poll_key, &poll);

        env.events().publish(
            (symbol_short!("CLOSE"),),
            (poll_id,),
        );
    }

    pub fn get_poll(env: Env, poll_id: u32) -> Poll {
        let key = symbol_short!("POLL");
        let poll_key = (&key, poll_id);
        env.storage()
            .persistent()
            .get(&poll_key)
            .expect("poll not found")
    }

    pub fn get_results(env: Env, poll_id: u32) -> soroban_sdk::Vec<u32> {
        let poll = Self::get_poll(env, poll_id);
        poll.votes
    }

    pub fn get_poll_count(env: Env) -> u32 {
        env.storage().instance().get(&NEXT_ID_KEY).unwrap_or(0)
    }

    pub fn has_voted(env: Env, poll_id: u32, voter: Address) -> bool {
        let voted_key = (symbol_short!("VOTED"), poll_id, voter);
        env.storage().persistent().has(&voted_key)
    }
}
