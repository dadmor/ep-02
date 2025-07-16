CREATE TABLE articles (                          
id UUID NOT NULL DEFAULT uuid_generate_v4(),   
lesson_id UUID NOT NULL,                       
title TEXT NOT NULL,                           
content TEXT NOT NULL,                         
sort_order INTEGER NOT NULL DEFAULT 0,         
created_at TIMESTAMPTZ NOT NULL DEFAULT now()  
);
CREATE TABLE badge_criteria (                    
id UUID NOT NULL DEFAULT uuid_generate_v4(),   
badge_id UUID NOT NULL,                        
criteria_type TEXT NOT NULL,                   
criteria_value INTEGER NOT NULL,               
created_at TIMESTAMPTZ NOT NULL DEFAULT now()  
);
CREATE TABLE badges (                            
id UUID NOT NULL DEFAULT uuid_generate_v4(),   
name TEXT NOT NULL,                            
description TEXT,                              
icon_url TEXT                                  
);
CREATE TABLE class_enrollments (                 
id UUID NOT NULL DEFAULT uuid_generate_v4(),   
user_id UUID NOT NULL,                         
class_id UUID NOT NULL,                        
enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
left_at TIMESTAMPTZ                            
);
CREATE TABLE class_lessons (                     
class_id UUID NOT NULL,                        
lesson_id UUID NOT NULL                        
);
CREATE TABLE classes (                           
id UUID NOT NULL DEFAULT uuid_generate_v4(),   
name TEXT NOT NULL,                            
education_year INTEGER NOT NULL,               
grade TEXT NOT NULL,                           
created_at TIMESTAMPTZ NOT NULL DEFAULT now()  
);
CREATE TABLE error_analysis (                    
subject TEXT,                                  
topic TEXT,                                    
question_text TEXT,                            
error_count BIGINT,                            
students_with_errors BIGINT                    
);
CREATE TABLE incorrect_answers (                 
id UUID NOT NULL DEFAULT uuid_generate_v4(),   
user_id UUID NOT NULL,                         
task_id UUID NOT NULL,                         
lesson_id UUID NOT NULL,                       
given_answer TEXT NOT NULL,                    
created_at TIMESTAMPTZ NOT NULL DEFAULT now()  
);
CREATE TABLE lessons (                           
id UUID NOT NULL DEFAULT uuid_generate_v4(),   
title TEXT NOT NULL,                           
description TEXT,                              
author_id UUID NOT NULL,                       
subject TEXT,                                  
education_level TEXT,                          
grade TEXT,                                    
topic TEXT,                                    
created_at TIMESTAMPTZ NOT NULL DEFAULT now()  
);
CREATE TABLE progress (                          
id UUID NOT NULL DEFAULT uuid_generate_v4(),   
user_id UUID NOT NULL,                         
lesson_id UUID NOT NULL,                       
score INTEGER NOT NULL,                        
total_tasks INTEGER NOT NULL,                  
correct_tasks INTEGER NOT NULL,                
attempts_count INTEGER NOT NULL DEFAULT 1,     
streak_bonus INTEGER NOT NULL DEFAULT 0,       
completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE student_rankings (                  
user_id UUID,                                  
username TEXT,                                 
xp INTEGER,                                    
level INTEGER,                                 
streak INTEGER,                                
rank BIGINT                                    
);
CREATE TABLE tasks (                             
id UUID NOT NULL DEFAULT uuid_generate_v4(),   
lesson_id UUID NOT NULL,                       
article_id UUID,                               
type USER-DEFINED NOT NULL,                    
question_text TEXT NOT NULL,                   
options JSONB,                                 
correct_answer TEXT NOT NULL,                  
explanation TEXT,                              
xp_reward INTEGER NOT NULL,                    
created_at TIMESTAMPTZ NOT NULL DEFAULT now()  
);
CREATE TABLE user_badges (                       
id UUID NOT NULL DEFAULT uuid_generate_v4(),   
user_id UUID NOT NULL,                         
badge_id UUID NOT NULL,                        
awarded_at TIMESTAMPTZ NOT NULL DEFAULT now()  
);
CREATE TABLE users (                             
id UUID NOT NULL,                              
email TEXT NOT NULL,                           
username TEXT,                                 
role USER-DEFINED NOT NULL,                    
avatar_url TEXT,                               
xp INTEGER NOT NULL DEFAULT 0,                 
level INTEGER NOT NULL DEFAULT 1,              
streak INTEGER NOT NULL DEFAULT 0,             
created_at TIMESTAMPTZ NOT NULL DEFAULT now()  
);
