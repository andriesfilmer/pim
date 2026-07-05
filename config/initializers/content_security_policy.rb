# Be sure to restart your server when you modify this file.

# Define an application-wide content security policy.
# See the Securing Rails Applications Guide for more information:
# https://guides.rubyonrails.org/security.html#content-security-policy-header

Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self
    policy.font_src    :self, :data
    policy.img_src     :self, :data
    policy.object_src  :none
    policy.script_src  :self
    policy.style_src   :self, :unsafe_inline
    policy.connect_src :self
    policy.frame_src   :none
    policy.base_uri    :self
    policy.form_action :self
  end

  # Generate a random per-request nonce for permitted importmap and inline scripts.
  # Do NOT use request.session.id here: it leaks the session id (a secret) into
  # every page and makes the nonce predictable, defeating its purpose.
  config.content_security_policy_nonce_generator = ->(request) { SecureRandom.base64(16) }
  config.content_security_policy_nonce_directives = %w(script-src)
end
