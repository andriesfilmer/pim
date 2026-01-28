# Rack::Attack configuration for rate limiting
class Rack::Attack
  # Throttle search requests by IP address
  # Limit to 30 requests per minute per IP
  throttle("search/ip", limit: 30, period: 1.minute) do |req|
    if req.path.end_with?("/search") && req.post?
      req.ip
    end
  end

  # Throttle login attempts by IP address
  # Limit to 5 requests per 20 seconds per IP
  throttle("logins/ip", limit: 5, period: 20.seconds) do |req|
    if req.path == "/users/sign_in" && req.post?
      req.ip
    end
  end

  # Throttle login attempts by email
  # Limit to 5 requests per 20 seconds per email
  throttle("logins/email", limit: 5, period: 20.seconds) do |req|
    if req.path == "/users/sign_in" && req.post?
      req.params.dig("user", "email")&.downcase&.strip
    end
  end

  # Throttle password reset requests
  # Limit to 5 requests per hour per IP
  throttle("password_reset/ip", limit: 5, period: 1.hour) do |req|
    if req.path == "/users/password" && req.post?
      req.ip
    end
  end

  # Custom response for throttled requests
  self.throttled_responder = lambda do |req|
    [
      429,
      { "Content-Type" => "text/plain" },
      ["Rate limit exceeded. Please try again later."]
    ]
  end
end
