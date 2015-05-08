IS_XMOVIES8 = (location.origin === "http://xmovies8.co");
IS_HDTVNET = (location.origin === "http://hdtvshows.net");
IS_YIFY = (location.origin === "http://yify.tv");
IS_YOUTUBE = (location.origin === "https://www.youtube.com");

function init() {

	if(!IS_YOUTUBE){
		buildHTMLContent();
	}


	//Apply html5 parameter to all movie links
	if(IS_XMOVIES8){
			$(".video, .inner h2 a").filter(function(){var x = this.href; this.href = x + "?player=html5";});
	}

	if(IS_HDTVNET){
		$(".play li a[href], a.main-tt").filter(function(){
				var x = this.href;
				this.href = x.replace("play.php", "play-in-html5.php");
			});

	}


	// if(IS_YOUTUBE){
	// 	console.log("Is youtube");
	// 	var loadSubs = $("<a/>" , {"href" : "javascript:;", "class" : "loadsrt"});
	// 	loadSubs.html("Load subtitles");
	// 	var menu = "<div class="ytp-menu-row"><div class="ytp-menu-cell"></div></div>";
	// 	console.log($('.ytp-menu-content'));
	// 	$('.ytp-menu-content').append(loadSubs);
	// }


}

function buildHTMLContent(){

	var anchorMovie = $("<a/>" , {"href" : "javascript:;", "class" : "loadsrt"}),
			subsLayer = $("<div />", {"class" : "subsLayer"}),
			container = $("<div/>" , {"class" : "subsContainer"}),
			throbber = $("<span/>" , {"class" : "throbber"}),
			img = $("<img/>",{"src":chrome.extension.getURL("images/throbber.gif")}),
			span = $("<span/>"),
			successMsg = $("<span class='successMsg'>Subtitles Loaded!</span>"),
			plusButton = $("<input type='button' value='+' id='plusBtn' style='width:15px;margin-left:5px'>"),
			minusButton = $("<input type='button' value='-' id='minusBtn' style='width:15px;margin-left:5px'>");


	anchorMovie.text("Load Subtitles");
	anchorMovie.css({"color" : "red" , "font-size" : 20});

	span.text("Loading....");

	throbber.append(img);
	throbber.append(span);
	throbber.hide();
	successMsg.hide();

	container.append(anchorMovie);
	container.append(throbber);
	container.append(successMsg);

	container.append(plusButton);
	container.append(minusButton);

	container.append(subsLayer);

	var videoCnt = $('video').parent().parent();
	if(IS_XMOVIES8){
		$('#subs-video-container').append(container);
	}
	else if(videoCnt.length == 0 ){
		$('body').prepend(container);
	}
	else {
		videoCnt.append(container);
	}


}

function displaySubtitles(track,cueList){
//console.log(cueList);

	// add some cues to show the text
	for(var i=0; i<cueList.length; i++){

		var cue = cueList[i];
		track.addCue(new VTTCue(cue.start, cue.end, cue.text));
	}
	// track.addCue(new VTTCue(0.5, 5, "My first Cue"));
	// track.addCue(new VTTCue(5.1, 9.5, "My <u>underlined</u> Cue"));
	// track.addCue(new VTTCue(9.6, 14.8, "My <c.small>small classname</c> Cue"));
	// track.addCue(new VTTCue(15, 36, "My <c.customstyle>custom classname</c> Cue"));

	//bind a cuechange-listener




}

function removeTextTracks(){

	var track = this,
			cues = track.cues;
	for (var i=cues.length;i>=0;i--) {
		track.removeCue(cues[i]);
	}
	return track;
}

function getSRTContent(url,fileName,callback){
	JSZipUtils.getBinaryContent(url, function(err, data) {
		if(err) {
			throw err; // or handle err
		}

		var zip = new JSZip(data);

		var reader = new FileReader();
		var output1 = zip.file(fileName).asText();

		//console.log(output1);



		//$(".output1").html(output1);
		callback(output1);


	});
}



String.prototype.convertToVttCueList = function(){

	return srt2webvtt(this);

};


function srt2webvtt(data) {
	// remove dos newlines
	var srt = data.replace(/\r+/g, '');
	// trim white space start and end
	srt = srt.replace(/^\s+|\s+$/g, '');

	// get cues
	var cuelist = srt.split('\n\n');
	var result = "";
	var cueObjList = [];

	if (cuelist.length > 0) {
		result += "WEBVTT\n\n";
		for (var i = 0; i < cuelist.length; i=i+1) {
			//result += convertSrtCue(cuelist[i]);
			cueObjList.push( convertSrtCue(cuelist[i]));
		}
	}


	return cueObjList;
}

function convertSrtCue(caption) {
	// remove all html tags for security reasons
	//srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');

	var cue = "";
	var s = caption.split(/\n/);
	var line = 0;


	var cueObj = {};

	// detect identifier
	if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
		cue += s[0].match(/\w/) + "\n";
		line += 1;

	}

	// get time strings
	if (s[line].match(/\d+:\d+:\d+/)) {
		// convert time string
		var m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
		if (m) {
			cue += m[1]+":"+m[2]+":"+m[3]+"."+m[4]+" --> "
			+m[5]+":"+m[6]+":"+m[7]+"."+m[8]+"\n";
			line += 1;
			var sh = Number.parseInt(m[1]),
					sm = Number.parseInt(m[2]),
					ss = Number.parseInt(m[3]) + (Number.parseInt(m[4]) *0.001) ;

			cueObj.start = (sh * 60 * 60) + (sm * 60) + ss ;

			var eh = Number.parseInt(m[5]),
					em = Number.parseInt(m[6]),
					es = Number.parseInt(m[7]) + (Number.parseInt(m[8]) *0.001) ;

					cueObj.end = (eh * 60 * 60) + (em * 60) + es ;
		} else {
			// Unrecognized timestring
			cueObj.start = "";
			cueObj.end = "";
			return "";
		}
	} else {
		// file format error or comment lines
		cueObj.start = "";
		cueObj.end = "";
		return "";
	}

	// get cue text
	if (s[line]) {
		cue += s[line] + "\n\n";
		cueObj.text = s[line] ;
		if(s[line+1]){
			cueObj.text += " " + s[line+1] ;
		}

	}

	//console.log(cueObj);

	return cueObj;
}


//Attaches subtitles to the video
function srt2vtt(){

	$(".subsLayer").hide();
	var video = $('video')[0],track;

	if(video.textTracks.length > 0){
			console.log(video.textTracks.length);
			track = removeTextTracks.call(video.textTracks[0]);
	}
	else {
		track = video.addTextTrack('subtitles', this.id, 'en');
	}

	//make it visible
	track.mode = 'showing';


	$(track).on('cuechange', function () {
		if (window.console) {
			var activeCues = $.prop(this, 'activeCues');
			  console.log(activeCues && activeCues[0] || 'exit');
		}
	});

	getSRTContent(this.getAttribute("data-src"),this.getAttribute("data-name"), function(srtCnt){
		//console.log(srtCnt);
		//SUBS_DATA = srt2webvtt(srtCnt);
		displaySubtitles(track,srt2webvtt(srtCnt));

		$('.successMsg').show();
		location.href = "#watch-movie";
		setTimeout(function(){$('.successMsg').hide();},5000 );
	});
}


function loadSubtitles(){
	var title,episode,query;

	if(IS_YIFY)
	{
		query = $("h1:first").text().split(" ").slice(1,-1).join(" ");
	}

else {
	title = $("h1.title, .play_right h2").text().trim().replace(/:/,"");
	//		episode = document.querySelectorAll(".movie-parts a.selected"),
	episode = IS_XMOVIES8 ?  document.querySelectorAll(".movie-parts a.selected") : document.querySelector(".play_right .on_l").innerText.trim().slice(0,2);
	query = title.replace(/\([0-9][0-9][0-9][0-9]\)/, "");

	if(episode.length > 0){
		//query += " Episode " + episode[0].innerText;
		query +=  IS_XMOVIES8 ? " Episode " + episode[0].innerText : " Episode " + episode	;
	}

}





	console.log(query);
	//getSubtitles(query);
	getSubtitlesFromExtension(query);

}



function getSubtitles(title){
	$.ajax({
		url : "http://localhost:3000/open",
		data : {
			"moviename" : title
		},
		type : "POST",
		success : function(data){
			//console.log(data);
			$(".throbber").hide();
			for(var i=0; i< data.results.length; i++) {
				var result = data.results[i];
				var anchor = $('<a/>' ,{ href : "javascript:;" , "class" : "subs-results" ,id : "result_" + result.IDSubtitleFile,"data-src" : result.ZipDownloadLink, "data-name" :result.SubFileName });
				anchor.text(result.MovieReleaseName);
				anchor.on("click", srt2vtt);
				$(".subsLayer").append(anchor);
			}

		},
		error : function(err){
			console.log(err);
		}
	});


}

function getSubtitlesFromExtension(title){
	$(".subsLayer").html("");
	Opensubtitles.account.login(function(data1){
		Opensubtitles.search.subtitle(data1.token,title,function(data){
			//console.log(data);
			$(".throbber").hide();
			if(data.data){
				for(var i=0; i< data.data.length; i++) {
					var result = data.data[i];
					var anchor = $('<a/>' ,{ href : "javascript:;" , "class" : "subs-results" ,id : "result_" + result.IDSubtitleFile,"data-src" : result.ZipDownloadLink, "data-name" :result.SubFileName });
					anchor.text(result.MovieReleaseName);
					anchor.on("click", srt2vtt);
					$(".subsLayer").append(anchor);
					$(".subsLayer").show();
				}
			}
			else{
				console.log("No Subtitles Available!");
				$(".subsLayer").html("No Subtitles Available!");
					$(".subsLayer").show();
			}

		});
	});
}


function plusButtonAction(track){
	//console.log("================================> Removing this track", SUBS_DATA , "Before");
	removeTextTracks.call(track);

	var modified_subs_data = [];
	for(var i=0; i<SUBS_DATA.length; i++ ){
		var cue = SUBS_DATA[i];

		cue.start += 0.5;
		cue.end += 0.5;
		modified_subs_data.push(cue);
	}

	SUBS_DATA = modified_subs_data;
	//console.log("================================>Track with increased", SUBS_DATA , "after");
	displaySubtitles(track,modified_subs_data);

}


function minusButtonAction(track){
//	console.log("================================> Removing this track", SUBS_DATA , "Before");
	removeTextTracks.call(track);

	var modified_subs_data = [];
	for(var i=0; i<SUBS_DATA.length; i++ ){
		var cue = SUBS_DATA[i];

		cue.start -= 0.5;
		cue.end -= 0.5;
		modified_subs_data.push(cue);
	}

	SUBS_DATA = modified_subs_data;

	//console.log("================================> Track with reduced", SUBS_DATA , "after");
	displaySubtitles(track,modified_subs_data);

}

$(window).load(function() {

	//setTimeout(init, 5000);
	// if(window.DoDetect){
		if(IS_XMOVIES8){
			var videoUrl = $(".movie-download:first a:last").attr("href");
			$(".the-content iframe").remove();
			var videoEl = $("<video height='600' width='800' src='"+ videoUrl + "' controls></video>");
			var videoDiv = $("<div id='subs-video-container'></div>");
			videoDiv.append(videoEl);
			

			// setTimeout ( function(){
				$(".the-content").append(videoDiv);

			// }, 12000);	
		}
		
	// }
	var url = "http://subscene.com/subtitle/download?mac=5h7cPZqJQtp3gxOlmYwTvlbLF_YeiqKwsB62_ws6DQE0BIyZn5wIDndaqVB0ZE_U0",
	fileName = "";
	init();

	$(".loadsrt").on("click" , function(e){
		loadSubtitles();
		e.preventDefault();
		return false;
	});

	$("#plusBtn").on("click", function(e){
		var video = $('video')[0],track;
		plusButtonAction(video.textTracks[0]);
		e.preventDefault();
		return false;
	});

	$("#minusBtn").on("click", function(e){
		var video = $('video')[0],track;
		minusButtonAction(video.textTracks[0]);
		e.preventDefault();
		return false;
	});

	$(document).ajaxStart(function(){
		$(".throbber").show();
	});

	$(document).on("keyup", function(e){
		  handleShorcutKeys(e);
			e.preventDefault();
	});

});

function handleShorcutKeys(e){
		var key = e.keyCode || e.which;

		var v = $("video")[0];
		if(key === 32){
			//space bar
			if(v.paused)  {
				v.play();
			}
			else
				v.pause();
		}

		if( key === 39 || key === 36){
			// forward
			setTime.call(v,10);
			return false;
		}
		if(key === 37 || key === 33){
			//rewind
			setTime.call(v,-10);
			return false;

		}

		if(key === 191){
			// Toggle subtitles display
			var tracks = v.textTracks[0];
			if(tracks.mode == 'showing'){
				tracks.mode = 'hidden';
			}
			else {
				tracks.mode = 'showing';
			}

		}

		if(key === 38){
		    //Volume up
		    setVolume.call(v,0.1);
	  }
	  if(key === 40){
		    //Volume down
		    setVolume.call(v,-0.1);
	  }
}

function setTime(tValue) {
	//  if no video is loaded, this throws an exception
	var video = this;
	try {
		if (tValue === 0) {
			video.currentTime = tValue;
		}
		else {
			video.currentTime += tValue;
		}

	} catch (err) {
		// errMessage(err) // show exception
		errMessage("Video content might not be loaded");
	}
}


 function setVolume(value) {
		var video = this,
    		vol = video.volume;
    vol += value;
    //  test for range 0 - 1 to avoid exceptions
    if (vol >= 0 && vol <= 1) {
      // if valid value, use it
      video.volume = vol;
    } else {
      // otherwise substitute a 0 or 1
      video.volume = (vol < 0) ? 0 : 1;
    }
  }
