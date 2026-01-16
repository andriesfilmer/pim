module ApplicationHelper

  def prepare_nice_data(first, second)
    first = first.sub(/^[^,]+,[^,]+,/, '') # Remove first two lines
    second = second.sub(/^[^,]+,[^,]+,/, '') # Remove first two lines
    diff_html = Diffy::Diff.new(second, first, :include_plus_and_minus_in_html => true).to_s(:html_simple)
    diff_html.gsub('\n', '<br>').html_safe
  end

  def truthy? value
    ActiveRecord::Type::Boolean.new.cast value
  end
end
