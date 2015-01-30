//addEvent(window, "load", editbox_init);

// document.addEventListener('DOMContentLoaded', function () {
  // document.getElementById('encode').addEventListener('onclick', encode);
  // document.getElementById('decode').addEventListener('onclick', decode);
  // document.getElementById('encDecFrm').addEventListener('onsubmit', 'return false');

// });
	// function encode() {
	// var obj = document.getElementById('dencoder');
	// var unencoded = obj.value;
	// obj.value = encodeURIComponent(unencoded).replace(/'/g,"%27").replace(/"/g,"%22");
// }
// function decode() {
	// var obj = document.getElementById('dencoder');
	// var encoded = obj.value;
	// obj.value = decodeURIComponent(encoded.replace(/\+/g,  " "));
// }



String.prototype.convertToVttCueList = function(){

      return srt2webvtt(this);

};

function convert(srt) {

    webvtt = srt2webvtt(srt);

}

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
              cueObj.start = m[1]+":"+m[2]+":"+m[3]+"."+m[4];
              cueObj.end = m[5]+":"+m[6]+":"+m[7]+"."+m[8];
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
            cueObj.text = s[line];

          }

          console.log(cueObj);

          return cueObj;
        }
