module PostsHelper
  def post_sort_link(column, label)
    active = @sort == PostsController::SORTABLE_COLUMNS[column]
    next_direction = active && @direction == 'asc' ? 'desc' : 'asc'

    arrow = content_tag :span, '', class: "sort-arrow #{@direction if active}"
    link_to safe_join([label, arrow]), posts_path(sort: column, direction: next_direction),
            class: "sort-link #{'active' if active}",
            data: { action: "click->post#sortPosts", column: column, direction: next_direction }
  end
end
