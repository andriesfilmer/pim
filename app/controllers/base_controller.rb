class BaseController < ApplicationController

  def index
    @user = User.find current_user.id
    @events = Event.where("(start >= ? AND start <= ?) OR (end >= ? AND end <= ?)",
     Date.today, Date.today + 14.day, Date.today, Date.today + 14.day)
      .where(user_id: current_user.id).order(start: :asc)
  end

  def update_offline_data
    current_user.update(offline_data: params[:offline_data] == 'true')
    render json: { offline_data: current_user.offline_data }
  end

  # Export selected resources to an .xlsx workbook, one sheet per resource.
  def backup
    resources = {
      'calendar'  => ['Calendar',  Event,    { start: :desc }],
      'contacts'  => ['Contacts',  Contact,  { id: :desc }],
      'posts'     => ['Posts',     Post,     { id: :desc }],
      'passwords' => ['Passwords', Passkey,  { id: :desc }]
    }.slice(*Array(params[:resources]))

    if resources.empty?
      redirect_to edit_user_registration_path, alert: 'Select at least one resource to back up.' and return
    end

    package = Axlsx::Package.new
    resources.each_value do |sheet_name, model, order|
      columns = model.column_names - %w[id user_id mongo_id]
      records = model.where(user_id: current_user.id).order(order)

      package.workbook.add_worksheet(name: sheet_name) do |sheet|
        sheet.add_row columns.map(&:capitalize)
        records.each { |record| sheet.add_row columns.map { |column| record[column].to_s } }
      end
    end

    send_data package.to_stream.read,
              filename: "backup-#{Date.today}.xlsx",
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  end

end
