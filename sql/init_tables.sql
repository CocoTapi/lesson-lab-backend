-- init_tables.sql

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  created_date TIMESTAMP WITHOUT TIME ZONE,
  last_update TIMESTAMP WITHOUT TIME ZONE,
  last_login TIMESTAMP WITHOUT TIME ZONE,
  user_name VARCHAR(50) NOT NULL
);

CREATE TABLE activities (
  activity_id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  instructions TEXT,
  summary TEXT,
  objectives TEXT,
  materials TEXT,
  links TEXT,
  image_num INT,
  create_date TIMESTAMP WITHOUT TIME ZONE,
  last_update TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE age_groups (
  age_group_id SERIAL PRIMARY KEY,
  age_group_title VARCHAR(20),
  last_update TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE durations (
  duration_id SERIAL PRIMARY KEY,
  duration_title SMALLINT,
  last_update TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE playlists (
  playlist_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  playlist_title VARCHAR(255) NOT NULL,
  create_date TIMESTAMP WITHOUT TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE tags (
  tag_id SERIAL PRIMARY KEY,
  tag_title VARCHAR(50) UNIQUE,
  last_update TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE activity_age_groups (
  activity_id INT,
  age_group_id INT,
  last_update TIMESTAMP WITHOUT TIME ZONE,
  PRIMARY KEY (activity_id, age_group_id),
  FOREIGN KEY (activity_id) REFERENCES activities(activity_id),
  FOREIGN KEY (age_group_id) REFERENCES age_groups(age_group_id)
);

CREATE TABLE activity_durations (
  duration_id INT,
  activity_id INT,
  last_update TIMESTAMP WITHOUT TIME ZONE,
  PRIMARY KEY (duration_id, activity_id),
  FOREIGN KEY (activity_id) REFERENCES activities(activity_id),
  FOREIGN KEY (duration_id) REFERENCES durations(duration_id)
);

CREATE TABLE activity_files (
  file_id SERIAL PRIMARY KEY,
  activity_id INT,
  file_url VARCHAR(255),
  last_update TIMESTAMP WITHOUT TIME ZONE,
  FOREIGN KEY (activity_id) REFERENCES activities(activity_id)
);

CREATE TABLE activity_tags (
  activity_id INT,
  tag_id INT,
  last_update TIMESTAMP WITHOUT TIME ZONE,
  PRIMARY KEY (tag_id, activity_id),
  FOREIGN KEY (activity_id) REFERENCES activities(activity_id),
  FOREIGN KEY (tag_id) REFERENCES tags(tag_id)
);

CREATE TABLE playlist_activities (
  playlist_id INT,
  activity_id INT,
  position INT,
  last_update TIMESTAMP WITHOUT TIME ZONE,
  PRIMARY KEY (playlist_id, activity_id),
  FOREIGN KEY (playlist_id) REFERENCES playlists(playlist_id),
  FOREIGN KEY (activity_id) REFERENCES activities(activity_id)
);

CREATE TABLE user_favorites (
  activity_id INT,
  user_id INT,
  last_update TIMESTAMP WITHOUT TIME ZONE,
  PRIMARY KEY (activity_id, user_id),
  FOREIGN KEY (activity_id) REFERENCES activities(activity_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);