/* ==========================================================================

   common.js
   
   ========================================================================== */

(function($) {
  
  'use strict';
  
  // Rollover
  var rollover = function(e){
    $(e).hover(function(){
      $(this).stop().animate({'opacity' : '0.5'}, 0);
    },function(){
      $(this).stop().animate({'opacity' : '1'}, 0);
    });
  }
  
  // Scroll top
  var pageup = function(e){
    $(e).click(function(){
      $('html,body').animate({ scrollTop: 0 }, 'normal');
    });
  }
  
  //Smooth scroll
  var smoothScroll = function(){
    $('a[href^=#]').click(function(){
      var speed = 500;
      var href= $(this).attr("href");
      var target = $(href == "#" || href == "" ? 'html' : href);
      var position = target.offset().top;
      $("html, body").animate({scrollTop:position}, speed, "swing");
      return false;
    });
  }
  
	// Clickable		
  var clickable = function(){
    $('.clickable').each(function() {
      var t = $(this);
      var a = t.find('a');
      var href = a.attr('href');
      t.on('click', function(e) {
        e.preventDefault();
        if(a.attr('target') == '_blank') {
          window.open(href);
        } else {
          location.href = href;
        }
      });
    });
  }
		
  //Scroll fade
  var fade = function(e){
    var target = $(e);   
    target.hide();
    $(window).scroll(function(){
      if($(this).scrollTop() > 300){
        target.fadeIn(300);
      }else{
        target.fadeOut(300);
      }
    });
  }
  
  // accordion
  var accordion = function(openBtn) {
    $(openBtn).click(function(){
      if($('#'+$(this).attr('data-accordion-target')).is(':visible')){
        $('#'+$(this).attr('data-accordion-target')).slideToggle(200);
      }else{
        $(openBtn).each(function(i, elm){
          $('#'+$(elm).attr('data-accordion-target')).hide();
        });
        $(this).toggleClass('active');
        $('#'+$(this).attr('data-accordion-target')).slideToggle(200);
      }
    });
  }
  
  // tabs
  var tabs = function(openBtn) {
    var tabContent = [];
    
    function clear(){
      $('.tabContent').each(function(i, elm){
        tabContent.push($(elm).attr('id'));
      });
      $(openBtn).each(function(i, elm){
        $(elm).removeClass('active');
        var data = $(elm).attr('data-tabs-target');
        if($.inArray(data, tabContent) != -1){
          $('#'+data).hide();
        }
      });
    }
    clear();
    $('#'+tabContent[0]).show();
    $('#'+tabContent[0]).css({'visibility':'visible'});
    $(openBtn).first().addClass('active');
    
    $(openBtn).click(function(){
      clear();
      $(this).addClass('active');
      $('#'+$(this).attr('data-tabs-target')).css({'visibility':'visible'});
      $('#'+$(this).attr('data-tabs-target')).fadeIn();
    });
  }
  
  // menuBar
  var menuBar = function(targetArea, openBtn, layerClass) {
    targetArea = $(targetArea);
    openBtn = $(openBtn);
    if(layerClass){
      targetArea.parent().after('<div class="'+layerClass+'"></div>');
      var lyr = $('.'+layerClass);
    }
    targetArea.hide().css({opacity: 0});
    
    openBtn.click(function(){
      targetArea.slideToggle({queue: false},350);
      targetArea.delay(100).animate({opacity: 1},250);
      lyr.fadeToggle({queue: false},350);
    });
    lyr.click(function(){
      targetArea.slideToggle({queue: false},350);
      lyr.fadeToggle({queue: false},350);
    });
    targetArea.find('a').click(function(){
      targetArea.slideToggle({queue: false},350);
    });
  }
  
  $(function () {
    rollover('.hover, .hovers a, .hoverlists li');
  });
  
})(jQuery);






