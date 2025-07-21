#!/usr/bin/env python3
"""
Migration script to transfer data from SQLite to MySQL
Run this script to migrate existing data before deploying to AWS
"""

import sqlite3
import pymysql
import json
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Database configurations
SQLITE_DB_PATH = "instance/database.sqlite"

# MySQL configuration - update these for your AWS RDS instance
MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'database': os.getenv('MYSQL_DATABASE', 'investment_parody_token'),
    'charset': 'utf8mb4'
}

def create_mysql_tables(mysql_cursor):
    """Create MySQL tables with proper schema"""
    
    # Drop existing tables if they exist (for clean migration)
    tables_to_drop = ['vote_response', 'vote', 'user']
    for table in tables_to_drop:
        mysql_cursor.execute(f"DROP TABLE IF EXISTS {table}")
    
    # Create User table
    user_table = """
    CREATE TABLE user (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(80) NOT NULL,
        displayName VARCHAR(120) NOT NULL,
        photo VARCHAR(500),
        followersCount INT,
        email VARCHAR(120) NOT NULL,
        passwordHash VARCHAR(128),
        ip VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """
    mysql_cursor.execute(user_table)
    print("✅ Created User table")
    
    # Create Vote table
    vote_table = """
    CREATE TABLE vote (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        options JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active (is_active),
        INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """
    mysql_cursor.execute(vote_table)
    print("✅ Created Vote table")
    
    # Create VoteResponse table
    vote_response_table = """
    CREATE TABLE vote_response (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vote_id INT NOT NULL,
        option VARCHAR(100) NOT NULL,
        vote_type VARCHAR(10) NOT NULL,
        voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id VARCHAR(50) NOT NULL,
        FOREIGN KEY (vote_id) REFERENCES vote(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        INDEX idx_vote_id (vote_id),
        INDEX idx_user_id (user_id),
        INDEX idx_option (option),
        INDEX idx_vote_type (vote_type),
        UNIQUE KEY unique_user_vote_option (user_id, vote_id, option)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """
    mysql_cursor.execute(vote_response_table)
    print("✅ Created VoteResponse table")

def migrate_users(sqlite_cursor, mysql_cursor):
    """Migrate users from SQLite to MySQL"""
    sqlite_cursor.execute("SELECT * FROM user")
    users = sqlite_cursor.fetchall()
    
    if not users:
        print("⚠️  No users found in SQLite database")
        return
    
    # Get column names
    columns = [description[0] for description in sqlite_cursor.description]
    
    for user in users:
        user_dict = dict(zip(columns, user))
        
        insert_query = """
        INSERT INTO user (id, username, displayName, photo, followersCount, email, passwordHash, ip)
        VALUES (%(id)s, %(username)s, %(displayName)s, %(photo)s, %(followersCount)s, %(email)s, %(passwordHash)s, %(ip)s)
        ON DUPLICATE KEY UPDATE
            username = VALUES(username),
            displayName = VALUES(displayName),
            photo = VALUES(photo),
            followersCount = VALUES(followersCount),
            email = VALUES(email),
            passwordHash = VALUES(passwordHash),
            ip = VALUES(ip)
        """
        
        mysql_cursor.execute(insert_query, user_dict)
    
    print(f"✅ Migrated {len(users)} users")

def migrate_votes(sqlite_cursor, mysql_cursor):
    """Migrate votes from SQLite to MySQL"""
    sqlite_cursor.execute("SELECT * FROM vote")
    votes = sqlite_cursor.fetchall()
    
    if not votes:
        print("⚠️  No votes found in SQLite database")
        return
    
    columns = [description[0] for description in sqlite_cursor.description]
    
    for vote in votes:
        vote_dict = dict(zip(columns, vote))
        
        # Convert pickled options to JSON
        options = vote_dict['options']
        if isinstance(options, bytes):
            # Handle pickled data from SQLite
            import pickle
            try:
                options_list = pickle.loads(options)
                options_json = json.dumps(options_list)
            except:
                options_json = json.dumps([])
        else:
            options_json = json.dumps(options if options else [])
        
        insert_query = """
        INSERT INTO vote (id, title, options, created_at, is_active)
        VALUES (%(id)s, %(title)s, %(options)s, %(created_at)s, %(is_active)s)
        ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            options = VALUES(options),
            is_active = VALUES(is_active)
        """
        
        vote_data = {
            'id': vote_dict['id'],
            'title': vote_dict['title'],
            'options': options_json,
            'created_at': vote_dict['created_at'],
            'is_active': vote_dict['is_active']
        }
        
        mysql_cursor.execute(insert_query, vote_data)
    
    print(f"✅ Migrated {len(votes)} votes")

def migrate_vote_responses(sqlite_cursor, mysql_cursor):
    """Migrate vote responses from SQLite to MySQL"""
    sqlite_cursor.execute("SELECT * FROM vote_response")
    responses = sqlite_cursor.fetchall()
    
    if not responses:
        print("⚠️  No vote responses found in SQLite database")
        return
    
    columns = [description[0] for description in sqlite_cursor.description]
    
    for response in responses:
        response_dict = dict(zip(columns, response))
        
        insert_query = """
        INSERT INTO vote_response (id, vote_id, option, vote_type, voted_at, user_id)
        VALUES (%(id)s, %(vote_id)s, %(option)s, %(vote_type)s, %(voted_at)s, %(user_id)s)
        ON DUPLICATE KEY UPDATE
            vote_type = VALUES(vote_type),
            voted_at = VALUES(voted_at)
        """
        
        mysql_cursor.execute(insert_query, response_dict)
    
    print(f"✅ Migrated {len(responses)} vote responses")

def main():
    """Main migration function"""
    print("🚀 Starting SQLite to MySQL migration...")
    
    # Check if SQLite database exists
    if not os.path.exists(SQLITE_DB_PATH):
        print(f"❌ SQLite database not found at {SQLITE_DB_PATH}")
        return
    
    try:
        # Connect to SQLite
        sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
        sqlite_cursor = sqlite_conn.cursor()
        print("✅ Connected to SQLite database")
        
        # Connect to MySQL
        mysql_conn = pymysql.connect(**MYSQL_CONFIG)
        mysql_cursor = mysql_conn.cursor()
        print("✅ Connected to MySQL database")
        
        # Create MySQL tables
        print("\n📋 Creating MySQL tables...")
        create_mysql_tables(mysql_cursor)
        mysql_conn.commit()
        
        # Migrate data
        print("\n📦 Migrating data...")
        migrate_users(sqlite_cursor, mysql_cursor)
        mysql_conn.commit()
        
        migrate_votes(sqlite_cursor, mysql_cursor)
        mysql_conn.commit()
        
        migrate_vote_responses(sqlite_cursor, mysql_cursor)
        mysql_conn.commit()
        
        print("\n🎉 Migration completed successfully!")
        
        # Print summary
        mysql_cursor.execute("SELECT COUNT(*) FROM user")
        user_count = mysql_cursor.fetchone()[0]
        
        mysql_cursor.execute("SELECT COUNT(*) FROM vote")
        vote_count = mysql_cursor.fetchone()[0]
        
        mysql_cursor.execute("SELECT COUNT(*) FROM vote_response")
        response_count = mysql_cursor.fetchone()[0]
        
        print(f"\n📊 Migration Summary:")
        print(f"   Users: {user_count}")
        print(f"   Votes: {vote_count}")
        print(f"   Vote Responses: {response_count}")
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Close connections
        if 'sqlite_conn' in locals():
            sqlite_conn.close()
        if 'mysql_conn' in locals():
            mysql_conn.close()

if __name__ == "__main__":
    main() 