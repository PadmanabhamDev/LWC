/**public class TrainApiWrapper{
	public boolean success;
	public String train_name;	//12393 S Kranti Sup Ex Running Status
	public String message;	//
	public String updated_time;	//Updated few seconds ago
	public List<data> data;
	class data {
		public boolean is_current_station;
		public String station_name;	//Rajendranagar T
		public String distance;	//-
		public String timing;	//19:2519:25
		public String delay;	//On Time
		public String platform;	//2
		public String halt;	//Source
	}
	public static TrainApiWrapper parse(String json){
		return (TrainApiWrapper) JSON.deserialize(json, TrainApiWrapper.class);
	}
}*/

public class TrainApiWrapper {
    public Boolean success;
    public String train_name;
    public String message;
    public String updated_time;
    public List<Data> data;

    public class Data {
        public Boolean is_current_station;
        public String station_name;
        public String distance;
        public String timing;
        public String delay;
        public String platform;
        public String halt;
    }

    public static TrainApiWrapper parse(String res) {
        return (TrainApiWrapper) JSON.deserialize(res, TrainApiWrapper.class);
    }
}