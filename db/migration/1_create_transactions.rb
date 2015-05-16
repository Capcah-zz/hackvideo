class CreateModel < ActiveRecord::Migration
  def up
    create_table :transactions do |t|
      t.string :name
    end
  end
 
  def down
    drop_table :transactions
  end
end
