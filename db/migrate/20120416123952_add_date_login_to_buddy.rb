class AddDateLoginToBuddy < ActiveRecord::Migration
  def change
    add_column :buddies, :date_login, :datetime
  end
end
