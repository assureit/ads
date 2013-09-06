module TimeUtil {
	var minute: number = 60 * 1000;
	var hour  : number = minute * 60;
	var day   : number = hour * 24;
	var month : number = day * 30;
	var year  : number = month * 365;

	export function formatDate(time: string) {
		var deltaTime = new Date().getTime() - new Date(time).getTime();

		if(deltaTime < minute) {
			return "just now";
		}else if(deltaTime >= minute && deltaTime < 2 * minute) {
			return "a minute ago";
		}else if(deltaTime >= 2 * minute && deltaTime < hour) {
			return "" + Math.floor(deltaTime / minute) + " minutes ago";
		}else if(deltaTime >= hour && deltaTime < 2 * hour) {
			return "an hour ago";
		}else if(deltaTime >= 2*hour && deltaTime < day) {
			return "" + Math.floor(deltaTime / hour) + " hours ago";
		}else if(deltaTime >= day && deltaTime < 2 * day) {
			return "a day ago";
		}else if(deltaTime >= 2*day && deltaTime < month) {
			return "" + Math.floor(deltaTime / day) + " days ago";
		}else if(deltaTime >= month && deltaTime < 2 * month) {
			return "a month ago";
		}else if(deltaTime >= 2*month && deltaTime < year) {
			return "" + Math.floor(deltaTime / month) + " months ago";
		}else if(deltaTime >= year && deltaTime < 2 * year) {
			return "an year ago";
		}else if(deltaTime >= 2*year) {
			return "" + Math.floor(deltaTime / year) + " years ago";
		}
		return "error";
	}

}
