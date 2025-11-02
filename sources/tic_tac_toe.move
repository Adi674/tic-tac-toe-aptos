module game_address::tic_tac_toe {
    use std::string::String;
    use std::vector;
    use std::signer;
    use std::timestamp;
    use aptos_framework::event;
    use aptos_framework::randomness;

    // Error codes
    const EGAME_NOT_FOUND: u64 = 1;
    const EGAME_ALREADY_FINISHED: u64 = 2;
    const EINVALID_MOVE: u64 = 3;
    const ENOT_YOUR_TURN: u64 = 4;
    const EPOSITION_OCCUPIED: u64 = 5;
    const EINVALID_POSITION: u64 = 6;
    const EGAME_NOT_INITIALIZED: u64 = 7;

    // Game constants
    const EMPTY: u8 = 0;
    const PLAYER_X: u8 = 1;
    const PLAYER_O: u8 = 2;

    const GAME_STATUS_ONGOING: u8 = 0;
    const GAME_STATUS_X_WINS: u8 = 1;
    const GAME_STATUS_O_WINS: u8 = 2;
    const GAME_STATUS_DRAW: u8 = 3;

    /// Game structure
    struct Game has copy, drop, store {
        id: u64,
        player_x: address,
        player_o: address,
        board: vector<u8>, // 3x3 board represented as vector of 9 elements
        current_player: u8,
        game_status: u8,
        moves_count: u8,
        created_at: u64,
        finished_at: u64,
        winner: address,
    }

    /// Player statistics
    struct PlayerStats has copy, drop, store {
        total_games: u64,
        wins: u64,
        losses: u64,
        draws: u64,
        win_rate: u64, // percentage * 100 (e.g., 7500 = 75.00%)
    }

    /// Game registry for managing all games
    struct GameRegistry has key {
        games: vector<Game>,
        next_game_id: u64,
        active_games: u64,
        total_games: u64,
    }

    /// Player registry for statistics
    struct PlayerRegistry has key {
        player_stats: vector<PlayerStats>,
        player_addresses: vector<address>,
    }

    /// Events
    #[event]
    struct GameCreatedEvent has drop, store {
        game_id: u64,
        player_x: address,
        player_o: address,
        created_at: u64,
    }

    #[event]
    struct MoveMadeEvent has drop, store {
        game_id: u64,
        player: address,
        position: u8,
        symbol: u8,
        move_number: u8,
    }

    #[event]
    struct GameFinishedEvent has drop, store {
        game_id: u64,
        winner: address,
        game_status: u8,
        total_moves: u8,
        duration: u64,
    }

    /// Initialize game registry
    public entry fun initialize_game_registry(account: &signer) {
        let account_addr = signer::address_of(account);
        
        if (!exists<GameRegistry>(account_addr)) {
            let game_registry = GameRegistry {
                games: vector::empty<Game>(),
                next_game_id: 1,
                active_games: 0,
                total_games: 0,
            };
            move_to(account, game_registry);
        }
        
        if (!exists<PlayerRegistry>(account_addr)) {
            let player_registry = PlayerRegistry {
                player_stats: vector::empty<PlayerStats>(),
                player_addresses: vector::empty<address>(),
            };
            move_to(account, player_registry);
        }
    }

    /// Create a new game (single player vs computer)
    public entry fun create_game_vs_computer(player: &signer) acquires GameRegistry {
        let player_addr = signer::address_of(player);
        let computer_addr = @0x1; // Use a fixed address for computer
        
        create_game_internal(player_addr, player_addr, computer_addr);
    }

    /// Create a new game between two players
    public entry fun create_game_vs_player(
        creator: &signer,
        opponent: address
    ) acquires GameRegistry {
        let creator_addr = signer::address_of(creator);
        create_game_internal(creator_addr, creator_addr, opponent);
    }

    /// Internal function to create a game
    fun create_game_internal(
        registry_addr: address,
        player_x: address,
        player_o: address
    ) acquires GameRegistry {
        assert!(exists<GameRegistry>(registry_addr), EGAME_NOT_INITIALIZED);
        
        let registry = borrow_global_mut<GameRegistry>(registry_addr);
        let game_id = registry.next_game_id;
        let current_time = timestamp::now_seconds();
        
        // Initialize empty board (9 positions)
        let board = vector::empty<u8>();
        let i = 0;
        while (i < 9) {
            vector::push_back(&mut board, EMPTY);
            i = i + 1;
        };
        
        let new_game = Game {
            id: game_id,
            player_x,
            player_o,
            board,
            current_player: PLAYER_X, // X always starts
            game_status: GAME_STATUS_ONGOING,
            moves_count: 0,
            created_at: current_time,
            finished_at: 0,
            winner: @0x0,
        };
        
        vector::push_back(&mut registry.games, new_game);
        registry.next_game_id = game_id + 1;
        registry.active_games = registry.active_games + 1;
        registry.total_games = registry.total_games + 1;
        
        // Emit event
        event::emit(GameCreatedEvent {
            game_id,
            player_x,
            player_o,
            created_at: current_time,
        });
    }

    /// Make a move in the game
    public entry fun make_move(
        player: &signer,
        registry_addr: address,
        game_id: u64,
        position: u8
    ) acquires GameRegistry {
        let player_addr = signer::address_of(player);
        assert!(exists<GameRegistry>(registry_addr), EGAME_NOT_INITIALIZED);
        assert!(position < 9, EINVALID_POSITION);
        
        let registry = borrow_global_mut<GameRegistry>(registry_addr);
        let game = find_game_mut(&mut registry.games, game_id);
        
        // Validate move
        assert!(game.game_status == GAME_STATUS_ONGOING, EGAME_ALREADY_FINISHED);
        assert!(*vector::borrow(&game.board, (position as u64)) == EMPTY, EPOSITION_OCCUPIED);
        
        // Check if it's player's turn
        let is_player_x = player_addr == game.player_x;
        let is_player_o = player_addr == game.player_o;
        assert!(is_player_x || is_player_o, ENOT_YOUR_TURN);
        
        let expected_player = if (game.current_player == PLAYER_X) { game.player_x } else { game.player_o };
        assert!(player_addr == expected_player, ENOT_YOUR_TURN);
        
        // Make the move
        let symbol = game.current_player;
        *vector::borrow_mut(&mut game.board, (position as u64)) = symbol;
        game.moves_count = game.moves_count + 1;
        
        // Emit move event
        event::emit(MoveMadeEvent {
            game_id,
            player: player_addr,
            position,
            symbol,
            move_number: game.moves_count,
        });
        
        // Check for win condition
        if (check_winner(&game.board)) {
            game.game_status = if (symbol == PLAYER_X) { GAME_STATUS_X_WINS } else { GAME_STATUS_O_WINS };
            game.winner = player_addr;
            game.finished_at = timestamp::now_seconds();
            registry.active_games = registry.active_games - 1;
            
            // Emit game finished event
            event::emit(GameFinishedEvent {
                game_id,
                winner: player_addr,
                game_status: game.game_status,
                total_moves: game.moves_count,
                duration: game.finished_at - game.created_at,
            });
        } else if (game.moves_count == 9) {
            // Draw
            game.game_status = GAME_STATUS_DRAW;
            game.finished_at = timestamp::now_seconds();
            registry.active_games = registry.active_games - 1;
            
            // Emit draw event
            event::emit(GameFinishedEvent {
                game_id,
                winner: @0x0,
                game_status: GAME_STATUS_DRAW,
                total_moves: game.moves_count,
                duration: game.finished_at - game.created_at,
            });
        } else {
            // Switch turns
            game.current_player = if (game.current_player == PLAYER_X) { PLAYER_O } else { PLAYER_X };
        }
    }

    /// Computer makes a random move (for single player mode)
    public entry fun computer_move(
        registry_addr: address,
        game_id: u64
    ) acquires GameRegistry {
        assert!(exists<GameRegistry>(registry_addr), EGAME_NOT_INITIALIZED);
        
        let registry = borrow_global_mut<GameRegistry>(registry_addr);
        let game = find_game_mut(&mut registry.games, game_id);
        
        assert!(game.game_status == GAME_STATUS_ONGOING, EGAME_ALREADY_FINISHED);
        assert!(game.current_player == PLAYER_O, ENOT_YOUR_TURN);
        assert!(game.player_o == @0x1, ENOT_YOUR_TURN); // Ensure it's computer's turn
        
        // Find available positions
        let available_positions = vector::empty<u8>();
        let i = 0;
        while (i < 9) {
            if (*vector::borrow(&game.board, i) == EMPTY) {
                vector::push_back(&mut available_positions, (i as u8));
            };
            i = i + 1;
        };
        
        if (vector::length(&available_positions) > 0) {
            // Use randomness to pick a position
            let random_index = randomness::u64_range(0, vector::length(&available_positions));
            let position = *vector::borrow(&available_positions, random_index);
            
            // Make the move
            *vector::borrow_mut(&mut game.board, (position as u64)) = PLAYER_O;
            game.moves_count = game.moves_count + 1;
            
            // Emit move event
            event::emit(MoveMadeEvent {
                game_id,
                player: @0x1,
                position,
                symbol: PLAYER_O,
                move_number: game.moves_count,
            });
            
            // Check for win condition
            if (check_winner(&game.board)) {
                game.game_status = GAME_STATUS_O_WINS;
                game.winner = @0x1;
                game.finished_at = timestamp::now_seconds();
                registry.active_games = registry.active_games - 1;
                
                event::emit(GameFinishedEvent {
                    game_id,
                    winner: @0x1,
                    game_status: game.game_status,
                    total_moves: game.moves_count,
                    duration: game.finished_at - game.created_at,
                });
            } else if (game.moves_count == 9) {
                // Draw
                game.game_status = GAME_STATUS_DRAW;
                game.finished_at = timestamp::now_seconds();
                registry.active_games = registry.active_games - 1;
                
                event::emit(GameFinishedEvent {
                    game_id,
                    winner: @0x0,
                    game_status: GAME_STATUS_DRAW,
                    total_moves: game.moves_count,
                    duration: game.finished_at - game.created_at,
                });
            } else {
                // Switch back to player
                game.current_player = PLAYER_X;
            }
        }
    }

    /// Helper function to find a game by ID
    fun find_game_mut(games: &mut vector<Game>, game_id: u64): &mut Game {
        let games_len = vector::length(games);
        let i = 0;
        while (i < games_len) {
            let game = vector::borrow_mut(games, i);
            if (game.id == game_id) {
                return game
            };
            i = i + 1;
        };
        abort EGAME_NOT_FOUND
    }

    /// Check if there's a winner on the board
    fun check_winner(board: &vector<u8>): bool {
        // Check rows
        if (check_line(board, 0, 1, 2) || 
            check_line(board, 3, 4, 5) || 
            check_line(board, 6, 7, 8)) {
            return true
        };
        
        // Check columns
        if (check_line(board, 0, 3, 6) || 
            check_line(board, 1, 4, 7) || 
            check_line(board, 2, 5, 8)) {
            return true
        };
        
        // Check diagonals
        if (check_line(board, 0, 4, 8) || 
            check_line(board, 2, 4, 6)) {
            return true
        };
        
        false
    }

    /// Check if three positions form a winning line
    fun check_line(board: &vector<u8>, pos1: u64, pos2: u64, pos3: u64): bool {
        let val1 = *vector::borrow(board, pos1);
        let val2 = *vector::borrow(board, pos2);
        let val3 = *vector::borrow(board, pos3);
        
        val1 != EMPTY && val1 == val2 && val2 == val3
    }

    /// View functions
    #[view]
    public fun get_game(registry_addr: address, game_id: u64): Game acquires GameRegistry {
        assert!(exists<GameRegistry>(registry_addr), EGAME_NOT_INITIALIZED);
        let registry = borrow_global<GameRegistry>(registry_addr);
        
        let games_len = vector::length(&registry.games);
        let i = 0;
        while (i < games_len) {
            let game = vector::borrow(&registry.games, i);
            if (game.id == game_id) {
                return *game
            };
            i = i + 1;
        };
        abort EGAME_NOT_FOUND
    }

    #[view]
    public fun get_active_games(registry_addr: address): vector<Game> acquires GameRegistry {
        if (!exists<GameRegistry>(registry_addr)) {
            return vector::empty<Game>()
        };
        
        let registry = borrow_global<GameRegistry>(registry_addr);
        let active_games = vector::empty<Game>();
        let games_len = vector::length(&registry.games);
        let i = 0;
        
        while (i < games_len) {
            let game = vector::borrow(&registry.games, i);
            if (game.game_status == GAME_STATUS_ONGOING) {
                vector::push_back(&mut active_games, *game);
            };
            i = i + 1;
        };
        
        active_games
    }

    #[view]
    public fun get_player_games(registry_addr: address, player: address): vector<Game> acquires GameRegistry {
        if (!exists<GameRegistry>(registry_addr)) {
            return vector::empty<Game>()
        };
        
        let registry = borrow_global<GameRegistry>(registry_addr);
        let player_games = vector::empty<Game>();
        let games_len = vector::length(&registry.games);
        let i = 0;
        
        while (i < games_len) {
            let game = vector::borrow(&registry.games, i);
            if (game.player_x == player || game.player_o == player) {
                vector::push_back(&mut player_games, *game);
            };
            i = i + 1;
        };
        
        player_games
    }

    #[view]
    public fun get_game_stats(registry_addr: address): (u64, u64, u64) acquires GameRegistry {
        if (!exists<GameRegistry>(registry_addr)) {
            return (0, 0, 0)
        };
        
        let registry = borrow_global<GameRegistry>(registry_addr);
        (registry.total_games, registry.active_games, registry.total_games - registry.active_games)
    }

    #[view]
    public fun get_board_state(registry_addr: address, game_id: u64): vector<u8> acquires GameRegistry {
        let game = get_game(registry_addr, game_id);
        game.board
    }

    #[view]
    public fun is_game_finished(registry_addr: address, game_id: u64): bool acquires GameRegistry {
        let game = get_game(registry_addr, game_id);
        game.game_status != GAME_STATUS_ONGOING
    }
}