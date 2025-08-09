-- Current database backup for migration to Supabase
-- Generated: 2025-08-09

-- Users data
INSERT INTO users (id, email, first_name, last_name, profile_image_url, role, tenant_id, created_at, updated_at, password, username) VALUES
('sameer.hassan06@gmail.com', 'sameer.hassan06@gmail.com', 'Sameer', 'Hassan', NULL, 'business_admin', '38bc07ed-c1f5-4eda-9199-9efaca21ded3', '2025-08-09 10:13:43.092637', '2025-08-09 10:13:43.092637', NULL, NULL),
('fa136235-bb9c-43e2-995b-1c03693ba2d7', 'test4@example.com', 'Test', 'User', NULL, 'business_member', NULL, '2025-08-09 17:19:20.7328', '2025-08-09 17:19:20.7328', 'c4e7965198fffbb3382c4e35a37dbc3874e08570939b94585561b65b86707167de8a854ea10199a708eea23bc9bdad133ec1aa9f7a10124077c9d011914b3b92.e7564eb3397b72028dbe07c77bb82a55', 'testuser4'),
('28c93ab2-04e8-4640-a5ef-b036eea43a9f', 'sameer.hassan0611@gmail.com', 'Sameer', 'Hassan', NULL, 'business_member', NULL, '2025-08-09 17:23:50.362529', '2025-08-09 17:23:50.362529', '1c2f0d387f071df822bdde4104b93dadacef1499d2b689b682c9216a78c3fef87bad70efd5efa21123080e4511e8a1c010d52115bb5344dc985b74941b04385c.9175fdacc84918e0657d18d2aa4ec713', 'sameer123'),
('1999ec7b-6019-44d3-8668-6f3b6f085707', 'sameer.hassan0226@gmail.com', 'Sameer', 'Hassan', NULL, 'business_admin', 'bffa3e27-0081-42e3-b45d-1516f54b8989', '2025-08-09 17:32:13.083597', '2025-08-09 17:32:40.019', '4f7d435437132d6347cddb7f482ed31222eafd849694d06721c07e0cad219930d7950d1a605a0eb4fae0fdb06a0469e150400e236aedefb418e4d8ce6aa3b0e1.384cba546939320469c529d8c1996289', 'sameer'),
('d6897bc8-fae2-4064-8172-e2cea887524b', 'sameer.hassan06333@gmail.com', 'Sameer', 'Hassan', NULL, 'business_admin', '16c9dbd8-e562-4f65-8ff1-9375a033dfbb', '2025-08-09 17:37:40.157369', '2025-08-09 17:37:40.233', 'cfed1048c32f657784955e7136e392b5b86df24efb708984e89eafbc87afdc4f117dd01a524d9670084e6a4bd159bc01fec53a6fb2787be9924604876cd99d95.318da65152c278e3e63ca1800c28b72f', 'tester'),
('89977d4d-505b-4dad-a36e-ff76511b3eab', 'sameer.hassan1234@gmail.com', 'Sameer', 'Hassan', NULL, 'business_admin', 'f550988c-5bc3-4394-8dac-bf043b6badf9', '2025-08-09 17:42:57.952683', '2025-08-09 17:42:58.144', '1144575b40b972f61bd86d0c91c7f6a464d91a7508566b7a7fd25541a8ab04449846121075f624398048a841ae7a6e169d9b42ee912b9bd712844fe16c4cdc6c.d05b500386b9c1d14517900fbba33f4c', 'sameer1234'),
('45909019', 'khanarshida24@gmail.com', 'Sameer', 'Khan', NULL, 'superadmin', NULL, '2025-08-09 09:45:39.894786', '2025-08-09 10:07:53.363', '02996364fb74b2d642bcb188bdd9538107b21d13a8a29ccf40eb8e282b0e75cffa2e0bf23fa9ec0ff0d7ae868ea4dbe7e21fb90fbd317ca29f8e1c81515daa33.ff3e2ce250b249b24046da20adb99058', 'admin');

-- Tenants data
INSERT INTO tenants (id, name, domain, website, logo_url, subscription_status, subscription_plan, subscription_ends_at, created_at, updated_at) VALUES
('62235bb0-a576-4ccb-a935-f20a629c4fca', 'Sameer', 'pixelfogg.com', 'https://247cashwin.site', NULL, 'active', 'starter', NULL, '2025-08-09 10:06:55.722907', '2025-08-09 10:07:22.168'),
('38bc07ed-c1f5-4eda-9199-9efaca21ded3', 'Splash', 'bigwin7.jj', 'https://247cashwin.site', NULL, 'trialing', 'starter', NULL, '2025-08-09 10:13:43.048147', '2025-08-09 10:13:43.048147'),
('bffa3e27-0081-42e3-b45d-1516f54b8989', 'winsure', 'https://clubxp.in', NULL, NULL, 'trialing', 'starter', NULL, '2025-08-09 17:32:39.994347', '2025-08-09 17:32:39.994347'),
('16c9dbd8-e562-4f65-8ff1-9375a033dfbb', 'Sameer''s Business', NULL, NULL, NULL, 'trialing', 'starter', NULL, '2025-08-09 17:37:40.211716', '2025-08-09 17:37:40.211716'),
('f550988c-5bc3-4394-8dac-bf043b6badf9', 'Sameer''s Business', NULL, NULL, NULL, 'trialing', 'starter', NULL, '2025-08-09 17:42:58.096991', '2025-08-09 17:42:58.096991');

-- Chatbots data
INSERT INTO chatbots (id, tenant_id, name, description, status, welcome_message, fallback_message, theme, flows, is_active, embed_code, created_at, updated_at) VALUES
('f6a0b7c4-8152-45d6-bbdf-88044bd75acf', 'f550988c-5bc3-4394-8dac-bf043b6badf9', 'ddasdas', NULL, 'draft', 'Hi! How can I help you today?', 'I''m sorry, I didn''t understand that. Can you please rephrase your question?', '{"textColor": "#000000", "primaryColor": "#6366F1", "secondaryColor": "#8B5CF6", "backgroundColor": "#FFFFFF"}', '{}', false, NULL, '2025-08-09 17:55:01.194811', '2025-08-09 17:55:01.194811'),
('78ac0ba0-0363-4033-9068-dfe06f00f736', 'f550988c-5bc3-4394-8dac-bf043b6badf9', 'dsfdsfcsa', NULL, 'published', 'Hi! How can I help you today?', 'I''m sorry, I didn''t understand that. Can you please rephrase your question?', '{"textColor": "#000000", "primaryColor": "#6366F1", "secondaryColor": "#8B5CF6", "backgroundColor": "#FFFFFF"}', '{"nodes": [], "version": 1754762144232, "startNode": null}', true, NULL, '2025-08-09 17:54:26.602619', '2025-08-09 17:55:44.951');

-- Leads data
INSERT INTO leads (id, tenant_id, chatbot_id, email, name, phone, source, score, status, notes, metadata, created_at, updated_at) VALUES
('61692473-3290-40a6-9cbc-55ce53024511', 'f550988c-5bc3-4394-8dac-bf043b6badf9', NULL, 'sameer.hassan06@gmail.com', 'sdffd', '07050011118', 'manual', 0, 'qualified', NULL, NULL, '2025-08-09 17:56:01.044902', '2025-08-09 17:56:11.172');