CREATE TABLE audit_requests (                             
id UUID NOT NULL DEFAULT gen_random_uuid(),             
beneficiary_id UU🧹 Czyszczenie pliku wynikowego...
  
postal_code TEXT NOT NULL,                              
city TEXT NOT NULL,                                     
street_address TEXT NOT NULL,                           
phone_number TEXT NOT NULL,                             
status TEXT NOT NULL DEFAULT 'pending'::text,           
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
audit_purpose TEXT,                                     
building_type TEXT,                                     
building_year INTEGER,                                  
living_area NUMERIC,                                    
review_rating INTEGER,                                  
review_comment TEXT,                                    
contact_preferences TEXT,                               
heated_area NUMERIC,                                    
heating_system TEXT,                                    
insulation_status TEXT,                                 
preferred_date DATE,                                    
notes TEXT                                              
);
CREATE TABLE auditor_offers (                             
id UUID NOT NULL DEFAULT gen_random_uuid(),             
request_id UUID NOT NULL,                               
auditor_id UUID NOT NULL,                               
price NUMERIC NOT NULL,                                 
duration_days INTEGER NOT NULL,                         
status TEXT NOT NULL DEFAULT 'pending'::text,           
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
description TEXT                                        
);
CREATE TABLE auditor_portfolio_items (                    
id UUID NOT NULL DEFAULT gen_random_uuid(),             
auditor_id UUID NOT NULL,                               
title TEXT NOT NULL,                                    
location TEXT NOT NULL,                                 
postal_code TEXT,                                       
completion_date DATE,                                   
building_type TEXT,                                     
building_area NUMERIC,                                  
building_year INTEGER,                                  
description TEXT NOT NULL,                              
scope_of_work TEXT,                                     
results_summary TEXT,                                   
energy_class_before TEXT,                               
energy_class_after TEXT,                                
main_image_url TEXT,                                    
additional_images TEXT[],                               
is_featured BOOLEAN DEFAULT false,                      
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
key_features TEXT[] DEFAULT '{}'::text[]                
);
CREATE TABLE auditor_profiles (                           
id UUID NOT NULL DEFAULT gen_random_uuid(),             
auditor_id UUID NOT NULL,                               
company_name TEXT NOT NULL,                             
nip TEXT,                                               
company_address TEXT,                                   
phone_number TEXT,                                      
email TEXT,                                             
website_url TEXT,                                       
licenses TEXT,                                          
certifications TEXT,                                    
experience_years INTEGER,                               
specializations TEXT[],                                 
description TEXT,                                       
is_active BOOLEAN NOT NULL DEFAULT true,                
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()           
);
CREATE TABLE contractor_offers (                          
id UUID NOT NULL DEFAULT gen_random_uuid(),             
request_id UUID NOT NULL,                               
contractor_id UUID NOT NULL,                            
price NUMERIC NOT NULL,                                 
scope TEXT NOT NULL,                                    
status TEXT NOT NULL DEFAULT 'pending'::text,           
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()           
);
CREATE TABLE contractor_portfolio_items (                 
id UUID NOT NULL DEFAULT gen_random_uuid(),             
contractor_id UUID NOT NULL,                            
title TEXT NOT NULL,                                    
location TEXT NOT NULL,                                 
postal_code TEXT,                                       
completion_date DATE,                                   
project_type TEXT,                                      
building_type TEXT,                                     
project_value NUMERIC,                                  
duration_days INTEGER,                                  
description TEXT NOT NULL,                              
scope_of_work TEXT,                                     
technologies_used TEXT[],                               
results_achieved TEXT,                                  
main_image_url TEXT,                                    
additional_images TEXT[],                               
before_images TEXT[],                                   
after_images TEXT[],                                    
is_featured BOOLEAN DEFAULT false,                      
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()           
);
CREATE TABLE contractor_portfolios (                      
id UUID NOT NULL DEFAULT gen_random_uuid(),             
contractor_id UUID NOT NULL,                            
company_name TEXT NOT NULL,                             
nip TEXT NOT NULL,                                      
company_address TEXT NOT NULL,                          
description TEXT,                                       
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()           
);
CREATE TABLE contractor_profiles (                        
id UUID NOT NULL DEFAULT gen_random_uuid(),             
contractor_id UUID NOT NULL,                            
company_name TEXT NOT NULL,                             
nip TEXT NOT NULL,                                      
company_address TEXT NOT NULL,                          
phone_number TEXT,                                      
email TEXT,                                             
website_url TEXT,                                       
licenses TEXT,                                          
certifications TEXT,                                    
experience_years INTEGER,                               
specializations TEXT[],                                 
description TEXT,                                       
is_active BOOLEAN NOT NULL DEFAULT true,                
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()           
);
CREATE TABLE efficiency_audits (                          
id UUID NOT NULL DEFAULT gen_random_uuid(),             
service_request_id UUID NOT NULL,                       
file_url TEXT NOT NULL,                                 
uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()          
);
CREATE TABLE moderation_logs (                            
id UUID NOT NULL DEFAULT gen_random_uuid(),             
operator_id UUID NOT NULL,                              
target_table TEXT NOT NULL,                             
target_id UUID NOT NULL,                                
action TEXT NOT NULL,                                   
reason TEXT,                                            
created_at TIMESTAMPTZ NOT NULL DEFAULT now()           
);
CREATE TABLE operator_contacts (                          
id UUID NOT NULL DEFAULT gen_random_uuid(),             
beneficiary_id UUID NOT NULL,                           
operator_id UUID,                                       
contact_type TEXT NOT NULL DEFAULT 'consultation'::text,
status TEXT NOT NULL DEFAULT 'pending'::text,           
phone_number TEXT,                                      
preferred_contact_time TEXT,                            
message TEXT,                                           
calculator_result JSONB,                                
scheduled_at TIMESTAMPTZ,                               
completed_at TIMESTAMPTZ,                               
notes TEXT,                                             
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
city TEXT,                                              
postal_code TEXT                                        
);
CREATE TABLE opinions (                                   
id UUID NOT NULL DEFAULT gen_random_uuid(),             
beneficiary_id UUID NOT NULL,                           
target_id UUID NOT NULL,                                
rating INTEGER NOT NULL,                                
comment TEXT,                                           
created_at TIMESTAMPTZ NOT NULL DEFAULT now()           
);
CREATE TABLE points_transactions (                        
id UUID NOT NULL DEFAULT gen_random_uuid(),             
user_id UUID NOT NULL,                                  
change INTEGER NOT NULL,                                
reason TEXT NOT NULL,                                   
created_at TIMESTAMPTZ NOT NULL DEFAULT now()           
);
CREATE TABLE reports (                                    
id UUID NOT NULL DEFAULT gen_random_uuid(),             
operator_id UUID NOT NULL,                              
title TEXT NOT NULL,                                    
payload JSONB NOT NULL,                                 
created_at TIMESTAMPTZ NOT NULL DEFAULT now()           
);
CREATE TABLE service_requests (                           
id UUID NOT NULL DEFAULT gen_random_uuid(),             
beneficiary_id UUID NOT NULL,                           
postal_code TEXT NOT NULL,                              
city TEXT NOT NULL,                                     
street_address TEXT NOT NULL,                           
phone_number TEXT NOT NULL,                             
heat_source TEXT,                                       
windows_count INTEGER,                                  
doors_count INTEGER,                                    
wall_insulation_m2 INTEGER,                             
attic_insulation_m2 INTEGER,                            
audit_file_url TEXT,                                    
status TEXT NOT NULL DEFAULT 'pending'::text,           
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
review_rating INTEGER,                                  
review_comment TEXT                                     
);
CREATE TABLE user_points (                                
id UUID NOT NULL DEFAULT gen_random_uuid(),             
user_id UUID NOT NULL,                                  
balance INTEGER NOT NULL DEFAULT 0,                     
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()           
);
CREATE TABLE user_profiles (                              
id UUID NOT NULL DEFAULT gen_random_uuid(),             
user_id UUID NOT NULL,                                  
name TEXT NOT NULL,                                     
phone_number TEXT,                                      
postal_code TEXT,                                       
city TEXT,                                              
address TEXT,                                           
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()           
);
CREATE TABLE users (                                      
id UUID NOT NULL,                                       
email TEXT NOT NULL,                                    
role TEXT NOT NULL,                                     
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
first_name TEXT,                                        
last_name TEXT,                                         
phone_number TEXT,                                      
city TEXT,                                              
postal_code TEXT,                                       
name TEXT,                                              
street_address TEXT                                     
);
