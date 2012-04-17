require 'spec_helper'

describe Connection do
  before :each do
    @connection = Connection.new({
      :buddy_id     => 1,
      :channel_id   => 1
      })
  end

  describe "#new" do
    it "takes two parameters and returns a Connection object" do
      @connection.should be_an_instance_of Connection
    end
  end
  
  describe "#buddy_id" do
    it "returns the correct buddy_id" do
      @connection.buddy_id.should eql 1
    end
  end
  
  describe "#channel_id" do
    it "returns the correct channel_id" do
      @connection.channel_id.should eql 1
    end
  end
  
  describe "#connectbuddyNonExistantBuddy" do
    fixtures :connections, :buddies
    it "tries to connect a non existant buddy to an existing channel" do
      new_conn = Connection.connect_buddy 15,1
      new_conn.should eql nil
    end
  end
  
  describe "connectBuddyNonExistantChannel" do
    fixtures :connections, :buddies, :channels
    it "tries to connect an existing buddy to a non existant channel" do
      new_conn = Connection.connect_buddy 1,5
      new_conn.should eql nil
    end
  end
  
  describe "connect buddy with existing channel" do
    fixtures :connections, :buddies, :channels
    it "tries to connect an existing buddy to an existent channel" do
      new_conn = Connection.connect_buddy 1,1
      new_conn.should be_an_instance_of Connection
    end
  end
  
  describe "disconnect buddy from existing channel" do
    fixtures :connections, :buddies, :channels
    it "tries to disconnect a buddy from an existing channel" do
      new_conn = Connection.disconnect_buddy 1,1
      new_conn.should eql nil
    end
  end
  
end
