UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
       raw_user_meta_data,
       '{role}',
       '"operator"',
       true
     )
WHERE id = '...';