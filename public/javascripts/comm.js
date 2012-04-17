var jugger_comm = undefined;
var data_session = undefined;
var data_channel = undefined;
var channel_selected = undefined;
var hidden_messages_size = 0;
var timer = 0;
var invite = false;
var idleTimeOut = null;

$("#buddies").live('pageinit', function(event){
    init();
    acordeonInit();
    resetIdle();
});

$(document).bind( "pagechange", function( e, data ) {
  hide_notification_div();
  acordeonInit();
});

$("#newMessajeCont").live('click', function(){
      hide_notification();
      $.mobile.changePage('buddies');
});

$(".buddyLink").live('click', function(){ 
     $("#mesg").html("");
});

$("#submit_setting_ajax").live('click', function(){
    var new_status = $("#status").val();
    var new_idle = $("#idle_time").val();
    var new_show_offline = $(".CheckboxSwitch").find('input')[0].checked;
    
     $.ajax({
        url: '/settings/save_setting',
        type: 'POST',
        data: "show_offline=" + new_show_offline + "&idle_time=" + new_idle + "&status=" + new_status,
        success: function(data){
          if(data.signed == "false") window.location.replace("/index.html");
          window.location.replace("buddies");
          $('[data-show-offline]').each(function(index, element){
            $(element).attr('data-show-offline',new_show_offline);
          });
          acordeonInit();
        }
      });  
  
});

$("#default_setting_ajax").live('click', function(){
    
     $.ajax({
        url: '/settings/save_setting',
        type: 'POST',
        data: "show_offline=false&idle_time=10&status=",
        success: function(data){
          if(data.signed == "false") window.location.replace("/index.html");
          window.location.replace("buddies");
        }
      });  
  
});


function init()
{
  $.ajax({
    url: '/chat/get_data',
    type: 'POST',
    data: "",
    success: function(data){
      data_session = data;
      inviteChat();
      channel_subscribe(data_session.org_channel);
      elements = $('.buddy_content[name]');
      elements.each(function(index, element){
        element = $(element);
        channel_subscribe(element.attr('name'));
        init_chat(element.attr('name'),false,undefined);
      });
      $("#buddy-status").live('change',function(){
          $.ajax({
            url: '/chat/set_status',
            type: 'POST',
            data: "channel="+data_session.org_channel+"&sender="+data_session.buddy_id+"&message="+$(this).val(),
            success: function(data){    
		if(data.signed == "false") window.location.replace("/index.html");	   
	   }
         })  
      });
    }
  }); 
	 

}

function channel_subscribe(channel)
{
    if (!(typeof jugger_comm !== undefined && jugger_comm))
    {
        data_session.secure =false;
	data_session.protocol = 'http';
	jugger_comm = new Juggernaut({host: window.location.hostname, protocol: 'http', secure: false});
	//jugger_comm = new Juggernaut(data_session);
        jugger_comm.meta = {buddy_id: data_session.buddy_id};
    }
    
    jugger_comm.on("disconnect", function(){ 
      
    });
    jugger_comm.on("connect", function(){ 
      
    });
 
    jugger_comm.subscribe(channel, function(data)
    {
      if((data.message["code"] == "invite") || (data.message["code"] == "accept")) {
        enableOrgChat(data);
        
      } else if(data.message["code"] == "write") {
        enableChat(data, false);
                
      } else if(data.message["code"] == "status") {
        setStatus(data.sender, data.message["message"]);
        
      } else if (data.message["code"] == "prediction") {
        setChatPrediction(data);

      } else if(data.message["code"] == "notify" && data.message.receiver_id == data_session.buddy_id ) {
        if($('.ui-page-active').attr('id') == "chat") show_notification_message(data);
        runEffect(data.sender);
      }      
      else if(data.message["code"] == "reload_nickname") {
        $("#" + data.sender).find(".buddyStatusMessage").html(data.message["message"]);
        if($("#header").attr("name") == data.sender)
        {
           $("#status_mssg").html(data.message["message"]);
        }
        $("#" + data.sender).attr( 'message_status', data.message["message"] );
      }

    });
}

function enableOrgChat(data)
{ alert("Entro1");
  if(data.receiver == data_session.buddy_id)
  {
      
      if(data.message["code"] == "invite")
      {
        $( "#"+data.sender).unbind("click");
        $( "#"+data.sender).click(function(event){
          
          if($(this).attr( 'message_status') != undefined) $('#status_mssg').text($(this).attr( 'message_status'));
          $( "#"+data.sender).removeClass("buddy_highlight");
          $(this).removeAttr('style');     
          $.ajax({
            url: "/chat/accept",
            type: 'POST',
            data: "channel="+data_session.org_channel+"&sender="+data_session.buddy_id+"&receiver="+$(this).attr("id")+"&channel_conn="+data.message["message"],
            success: function(conn_channel_data){
              if(conn_channel_data.signed == "false") window.location.replace("/index.html");
              channel_selected = conn_channel_data;
              $("#"+data.sender).attr( "name", channel_selected );
              $("#"+data.sender).attr( "indirect", true );
            }
          });
          jQuery('#header').attr('name',$(this).attr("id"));
          $.ajax({
              url: "/chat/get_buddy_info",
              type: 'POST',
              data: { buddy: $(this).attr("id")},
              success: function(buddy){
                if(buddy.signed == "false") window.location.replace("/index.html");
                jQuery('#header #status_circle').removeClass('Online Offline Busy Away');
                jQuery('#header #status_circle').addClass(buddy.status);
                jQuery('#header #name').text(buddy.name);
                jQuery('#header .picContainer > img')[0].src = buddy.pic;
              }
          }).done(function(){
		a
	});
        });

      }
      
      if(data.message["code"] == "accept" && data.message["channel_conn"] == channel_selected)
      {
        data_channel = data.message["message"];
        init_chat(data.message["channel_conn"], false, undefined);
        channel_subscribe(data.message["message"]);
        channel_selected = data.message.channel_conn;
        //$("#"+data.sender).attr("name", data.message.channel_conn);
      }
      if(data.message["code"] == "reload_nickname" ) {
      }
      
  }
  
  if(data.sender == data_session.buddy_id)
  {
      
      if(data.message["code"] == "invite")
      {
          init_buffer(data.message["message"], data.receiver)
          channel_subscribe(data.message["message"]);
      }
      
      if(data.message["code"] == "accept")
      {
        var is_indirect = $("#" + data.receiver).attr("indirect");
        if(is_indirect == "true")
        {
          init_chat(data.message["channel_conn"], true, undefined);
        }
        else
        {
          channel_subscribe(data.message["channel_conn"]);
          init_chat(data.message["channel_conn"], true, undefined);
        }
      }
      if(data.message["code"] == "reload_nickname" ) {
      }
  }
}

function enableChat(data, buffer)
{
  if(data.channel == channel_selected)
  {
    if(data.sender != data_session.buddy_id && ( $('.ui-page-active').attr('id') == "buddies" || $('.ui-page-active').attr('id') == "settings" ) && data.sender != undefined) runEffect(data.message['sender']);
    
    message = decode_tags(data.message["message"]);

    var who =  (data.message['sender'] == data_session.buddy_id)? 'left': 'right';
    var ul = '<div class="conversationContainer">';
    ul += '  <div class="triangle ' + who + '"></div>';
    ul += '  <div class="conversation">';
    ul += '    <div class="sender">';
    ul +=        data.message["senderName"];
    ul += '    </div>';
    ul += '    <div class="timestamp">';
    ul +=        data.message["date"];
    ul += '     </div>';
    ul += '     <div class="message">';
    ul +=         message;
    ul += '     </div>';
    ul += '   </div>';
    ul += '</div>';
    $("#mesg").append(ul);
    $(ul).css('float',who);
    if(data.message["sender"] == data_session.buddy_id){
      $("#msg_body").val("");
    }
    
    var mess_cont_height = $("#mesg").height();
    var rel_cont = $("#chat_container_rel").height();    
    
    $("#chat_container_abs").scrollTop(mess_cont_height - rel_cont + 10) 

  }
  else
  {
    if(data.sender != data_session.buddy_id)
    {
      if( $('.ui-page-active').attr('id') == "chat" )
      {
        show_notification_message(data);
      }
      $("#" + data.message['sender']).removeAttr('style');
      runEffect(data.message['sender']);
      $(".newMsjSender").attr( "last-id", data.sender );
      
    }
    
  }
  
  setTimeout(function(){window.scroll(0,$(document).height()+200)},300);
}

function inviteChat()
{
  $(".buddy_content" ).unbind('click');
  $(".buddy_content" ).click(function(event){
      
      $(this).removeClass("buddy_highlight");
      $(this).removeAttr('style');
      $("#newMessajeCont").css("height", "0px");
      if($(this).attr( 'message_status') != undefined) $('#status_mssg').text($(this).attr( 'message_status'));
      
      var objLi = $(this);
      jQuery('#header').attr('name',$(this).attr("id"));
      $.ajax({
          url: "/chat/get_buddy_info",
          type: 'POST',
          data: { buddy: $(this).attr("id")},
          success: function(buddy){
            if(buddy.signed == "false") window.location.replace("/index.html");
            jQuery('#header #status_circle').removeClass('Online Offline Busy Away');
            jQuery('#header #status_circle').addClass(buddy.status);
            jQuery('#header #name').text(buddy.name);
            jQuery('#header .picContainer > img')[0].src = buddy.pic;
          }
      }).done(function(){
	});

      if(objLi.attr('name') == undefined){
        $.ajax({
          url: "/chat/invite_return_channel",
          type: 'POST',
          data: "channel="+data_session.org_channel+"&sender="+data_session.buddy_id+"&receiver="+$(this).attr("id"),
          success: function(data_ch){
            if(data_ch.signed == "false") window.location.replace("/index.html");
            channel_selected = data_ch;
            objLi.attr('name', data_ch);
          }
        });
      } else {
        channel_selected = objLi.attr('name');
        
        $.ajax({
          url: "/chat/get_buffer",
          type: 'POST',
          data: "channel="+channel_selected+"&sender="+data_session.buddy_id,
          success: function(data_buf){
            if(data_buf.signed == "false") window.location.replace("/index.html");
            for (i=data_buf.length-1;i>=0;i--)
            {
                enableChat(data_buf[i], true);
            } 
          }
        });
      }
      $(this).removeAttr('style');
  });
}

function runEffect(buddy_id) {
    $( "#" + buddy_id ).addClass("buddy_highlight");
}

function init_chat(channel, buffer, id_sender)
{
  
  $("#chat_window").unbind("submit");
  $("#chat_window").submit(function(event) {
    event.preventDefault();
    $("#header-main").css("top", "0px")
    var message = $.trim(this.msg_body.value)
    real_sender = data_session.buddy_id;
    
    if(id_sender != undefined) real_sender = id_sender; 
    
    if (message != '')
    {
      message = safe_tags(message);

      $.ajax({
        url: "/chat/buffer",
        type: 'POST',
        data: "channel="+channel_selected+"&message="+message+"&sender="+real_sender,
        success: function(data_buffer){
          if(data_buffer.signed == "false") window.location.replace("/index.html");
          jQuery('#msg_body').keyup();
        }
      });

    }
    return false;
  });
  
  var msgBody = jQuery('#msg_body');
  msgBody.unbind('keyup');
  msgBody.keyup(function(){
    var element = jQuery(this);
    if (element.val() != '' && element.attr('prediction') != "writing") {
      var message = 'writing';
      $.ajax({
        url: "/chat/prediction",
        type: 'POST',
        data: {
          channel: channel_selected,
          message: message,
          sender: data_session.buddy_id
        },
        success: function(data){
          if(data.signed == "false") window.location.replace("/index.html");
        }
      });
      element.attr('prediction', 'writing');
    } else if ( element.val() == '' && element.attr('prediction') != "discard"){
      var message = 'discard';
      $.ajax({
        url: "/chat/prediction",
        type: 'POST',
        data: {
          channel: channel_selected,
          message: message,
          sender: data_session.buddy_id
        },
        success: function(data){
           if(data.signed == "false") window.location.replace("/index.html");
        }
      });
      element.attr('prediction', 'discard');
    }
  });
  
  if(buffer && id_sender == undefined )
  {
      $.ajax({
        url: "/chat/get_buffer",
        type: 'POST',
        data: "channel="+channel,
        success: function(data){
          if(data.signed == "false") window.location.replace("/index.html");
          for (i=data.length-1;i>=0;i--)
          {
              enableChat(data[i], true)
          }          
        }
      });
  }
}

function init_buffer(channel, receiver)
{
  
  $("#chat_window").unbind("submit");
  $("#chat_window").submit(function(event) {
    event.preventDefault();
    $("#header-main").css("top", "0px")
    var message = $.trim(this.msg_body.value)
    
    if (message != '')
    {
      
      message = safe_tags(message);

      $.ajax({
        url: "/chat/buffer",
        type: 'POST',
        data: "channel="+channel+"&message="+message+"&sender="+data_session.buddy_id,
        success: function(data){
           if(data.signed == "false") window.location.replace("/index.html");
          }
      });
      
      $.ajax({
        url: "/chat/send_notification",
        type: 'POST',
        data: "org_channel="+data_session.org_channel+"&message="+message+"&sender="+data_session.buddy_id+"&receiver="+receiver,
        success: function(data){
           if(data.signed == "false") window.location.replace("/index.html");
          }
      });
      
    }
    return false;
  });
  
}

function setStatus(sender, message)
{  
    $("#"+sender+" .buddyStatus").removeClass('Online Offline Busy Away').parent().removeClass('Online Offline Busy Away');
    $("#"+sender+" .buddyStatus").addClass(message).parent().addClass(message);
    if (sender == jQuery('#header').attr('name')){
      jQuery('#header #status_circle').removeClass('Online Offline Busy Away');
      jQuery('#header #status_circle').addClass(message);
    } else if(sender == data_session.buddy_id){
      jQuery('#header-main #status_circle').removeClass('Online Offline Busy Away');
      jQuery('#header-main #status_circle').addClass(message);
      $('#buddy-status [value=' + message + ']').attr('selected',true);
    }
    acordeonInit();
}

function hide_notification()
{
   $("#newMessajeCont").css("height", "0px");
   $("#mesg").html("");
   hidden_messages_size = 0;
}

function hide_notification_div()
{
   $("#newMessajeCont").css("height", "0px");
   hidden_messages_size = 0;
}

function show_notification_message(data)
{  
    if( $(".newMsjSender").attr("last-id") != undefined && $(".newMsjSender").attr("last-id") != data.message.sender ) 
    {
      hidden_messages_size = 0;
    }
    hidden_messages_size ++;
    $(".newMsjSender").attr( "last-id", data.message.sender );
    $(".newMsjSender").html(data.message.senderName);
    var sendMsj = $(".newMsjSender")[0];

    $(".newMessaje").html("");
    $(".newMessaje").append(sendMsj);
    $(".newMessaje").append(data.message.message);
    $(".picContainerTh img")[0].src = data.message.pic;
    $(".newMessajeCount").html(hidden_messages_size);
    $("#newMessajeCont").css("height", "32px");
    //$("#newMessajeCont").addClass("newMessajeMod");
    
}

function add_ellipsis(str)
{  
  if(str != undefined)
  {
    if(str.length > 26)
    {
      str = str.substr(0,25) + "...";
    }
  }
  return str;
}


function setChatPrediction ( data ){
  if(data.channel == channel_selected && data.sender != data_session.buddy_id){
    if (data.message.prediction == 'writing'){
      jQuery('#status_mssg').text('Is typing a message..');
    } else {
      jQuery('#status_mssg').text('');
      if($("#" + data.sender).attr("message_status") != undefined) jQuery('#status_mssg').text($("#" + data.sender).attr("message_status"));
    }
  }
}

function searchInContactsFilter(element){
  var filter = element.value.toLowerCase();
  jQuery('.buddy.acordeonListItem .buddyName[data-filter-text*=' + filter + ']').each(function (index,element){
    jQuery(element).parent().css('display','');
  });
  jQuery('.buddy.acordeonListItem .buddyName:not([data-filter-text*=' + filter + '])').each(function (index,element){
    jQuery(element).parent().css('display','none');
  });
  if (jQuery('.buddyTogleBtn.Hidden').length == 0){
    acordeonInit();
  }
}

function toggleSerch(){
  element = jQuery('.searchContainer');
  if (parseInt(element.height()) == 0 ){
    element.height(element.children().outerHeight());
  } else {
    element.height(0);
  }
}
function toggleAcordeon(btn){
  element = jQuery(btn);
  while (! element.hasClass('acordeon')){
    element = element.parent();
  }
  if (element.find('.AcordeonListHeaderBtn.Hidden').length != 0){
    var tHeight= 0;
    element.children().each(function (index, element){
      tHeight += jQuery(element).outerHeight();
    });
    element.height(tHeight);
    element.find('.AcordeonListHeaderBtn').removeClass('Hidden');
  } else {
    element.height(parseInt(element.children().outerHeight()) -1);
    element.find('.AcordeonListHeaderBtn').addClass('Hidden');
  }
}
function acordeonInit(){
  acordeons = jQuery('.acordeon');
  acordeons.each(function(index, element){
    element = jQuery(element);
    var tHeight= 0;
    element.children().each(function (index, child){
      if (element.find('.AcordeonListHeaderBtn.Hidden').length == 0 || index == 0){
        tHeight += jQuery(child).outerHeight();
      }
    });
    tHeight -= (tHeight == element.children().outerHeight())? 1 : 0;
    element.css({ 
      'height': tHeight,
      '-webkit-transition': 'height 0s linear',
      '-ms-transition': 'height 0s linear',
      '-moz-transition': 'height 0s linear',
      'transition': 'height 0s linear'
    });
    setTimeout(function(){element.css({ 
      '-webkit-transition': '',
      '-ms-transition': '',
      '-moz-transition': '',
      'transition': ''
    });},0);
  });
}
function toggleSwitch(element){
  var input = jQuery(element).find('input')[0];
  input.checked = !(input.checked);
}

$(document).live({
  click: resetIdle,
  keypress: resetIdle 
});

function resetIdle(){
  if (idleTimeOut){
    clearTimeout(idleTimeOut);
  }
  idleTimeOut = setTimeout(setIdle, (settings.idle_time  * 60 * 1000));
}

function setIdle(){
  $('#buddy-status [value=Away]').attr('selected',true).parent().change();
}

function safe_tags(str) 
{
    str =  $('<div/>').text(str).html();
    return encodeURIComponent(str);
}

function decode_tags(str)
{
    str = $('<div/>').html(str).html();
    return decodeURIComponent(str);
}



//----------- START GROUP CHAT---------------

    function create_group_chat(){
      
      
    }
    
    $("#invite_buddy_group").live('click', function(){
      
        var org_wide_channel = data_session.org_channel;
        $.ajax({
          url: "/buddies/get_buddies_by_org",
          type: 'POST',
          data: "org_id="+org_wide_channel,
          success: function(data){
            
             if(data.signed == "false") window.location.replace("/index.html");
             
             var buddie_chatter_id = $("#header").attr("name");
             var container_group = document.createElement('div');
             $(container_group).attr("style", "position:absolute; width:83%; height:auto; left:30px; top:50px;");
             $(container_group).attr("class", "buddy_list_group");
             $(container_group).attr("id", "buddy_group_container");
               
             for(var i = 0; i < data.length; i++)
             {
               console.info(data[i]);
               if(data[i].status != "Offline" && data[i].id != data_session.buddy_id && data[i].id != buddie_chatter_id)
               {
                  var bud_container = document.createElement('div');
                  $(bud_container).attr("style", "width:100%; height:40px;");
                  $(bud_container).attr("id", "group" + data[i].id);
                  
                  var image_cont_group = document.createElement('div');
                  $(image_cont_group).attr("style", "width:30px; height:30px; padding:4px; float:left;");
                  $(image_cont_group).attr("id", "buddy_img_cont");
                  
                  var image_buddy = document.createElement('img');
                  $(image_buddy).attr('src', data[i].small_photo_url);
                  $(image_buddy).attr("style", "width:30px; height:30px;");
                  $(image_buddy).attr('id', 'image_buddy');
                  image_cont_group.appendChild(image_buddy);
                  
                  $(name_p).attr("id", "name_inside");
                  $(name_p).html(data[i].name) ;
                  name_cont_group.appendChild(name_p);
                  
                  var status_cont_group = document.createElement('div');
                  $(status_cont_group).attr("id", "buddy_status_cont");
                  
                  var status_p = document.createElement('div');
                  $(status_p).attr("id", "status_inside");
                  $(status_p).html(data[i].nickname) ;
                  status_cont_group.appendChild(status_p);
                  
                  bud_container.appendChild(image_cont_group);
                  bud_container.appendChild(name_cont_group);
                  bud_container.appendChild(status_cont_group);
                  container_group.appendChild(bud_container);
                  document.querySelector("body").appendChild(container_group);
               }
             }
          }
        });
        
    });


//----------- END GROUP CHAT ----------------
