/*
* Easy Put.io
*
* Created by Baptiste Vincent on 2013-08-12.
* Copyright (c) 2013 Baptiste Vincent. All rights reserved.
*
*/

$(document).ready(function() {

    $("#menu a").on("focus", function(){
        $("#menu a").blur();
        $("#search_title").focus()
    });

    $("#menu a").on("click", function(){
        Putio_Function.go(this.id);
    });

    $("#logo img").on("click", function(){
        activeTab=$("#menu .active a").attr('id');
        _gaq.push(['_trackEvent', activeTab+' tab', 'click', 'Logo']);

        chrome.tabs.query(
            {
                url:"http://www.opensubtitles.org/*"
                            }, 
            function(data){
                if(data.length>0){
                    chrome.tabs.update(data[0].id, {
                        active:true,
                    })
                }
                else{
                    chrome.tabs.create({
                        url:"http://www.opensubtitles.org/"
                    });
                }
            }
        )

    });

    $(document.body).on('click', '#submit_search' ,function(e){
        category=$('#search_category').val();
        $("#search_result").html('<div id="pb_result"></div>');
        title=$('#search_title').val();
        _gaq.push(['_trackEvent', 'search tab','query', title]);
        Opensubtitles.account.login(function(data){
                Opensubtitles.search.subtitle(data.token,title,function(data){
                Opensubtitles_Function.displaySubtitleResult(data);
            })
        })
    });


    $(document.body).on('keypress', '#search_title' ,function(event){
        if(event.keyCode == 13){
            $("#submit_search").click();
        }
    });


    $(document.body).on('click', '.download_subtitle' ,function(e){
        download_url=$(this).attr('url');
        _gaq.push(['_trackEvent', 'search tab', 'click','Download Subtitle']);
        chrome.tabs.getSelected(undefined,function(data){
            chrome.tabs.update(data.id, {
                url:download_url
            });
        });
    });

    $(document.body).on('mouseleave', '#subtitle_result_list td:nth-child(2)' ,function(e){
        $(this).stop();
        $(this).stop();
        $(this).animate({ scrollLeft: 0 });
    });

    $(document.body).on('mouseenter', '#subtitle_result_list td:nth-child(2)' ,function(e){
        $(this).stop();
        scrollWidth=$(this)[0].scrollWidth
        $(this).delay(1000).animate({ scrollLeft: scrollWidth }, 5000);
    });

    $(document.body).on('change', '#language' ,function(e){
        subtitle_language=$(this).val();
        $('#search_title').attr('placeholder','E.g : Dexter S01E08');
        localStorage["default_subtitle_code"]=subtitle_language;
    })

    Opensubtitles_Function.init(localStorage["tabName"] || 'search');
});