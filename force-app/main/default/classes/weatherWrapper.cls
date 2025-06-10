public class weatherWrapper{
	public coord coord;
	public List<weather> weather;
	public String base;	//stations
	public main main;
	public Integer visibility;	//5000
	public wind wind;
	public clouds clouds;
	public Integer dt;	//1746771778
	public sys sys;
	public Integer timezone;	//19800
	public Integer id;	//1260086
	public String name;	//Patna
	public Integer cod;	//200
	class coord {
		public Double lon;	//85.1167
		public Double lat;	//25.6
	}
	class weather {
		public Integer id;	//721
		public String main;	//Haze
		public String description;	//haze
		public String icon;	//50d
	}
	class main {
		public Double temp;	//36.96
		public Double feels_like;	//37.69
		public Double temp_min;	//36.96
		public Double temp_max;	//36.96
		public Integer pressure;	//1005
		public Integer humidity;	//30
		public Integer sea_level;	//1005
		public Integer grnd_level;	//999
	}
	class wind {
		public Double speed;	//3.09
		public Integer deg;	//290
	}
	class clouds {
		public Integer all;	//40
	}
	class sys {
		public Integer type;	//1
		public Integer id;	//9129
		public String country;	//IN
		public Integer sunrise;	//1746747460
		public Integer sunset;	//1746795259
	}
	public static weatherWrapper parse(String json){
		return (weatherWrapper) System.JSON.deserialize(json, weatherWrapper.class);
	}
}