YUI.add("rg.views.publicprofile.ProfileContributionsFilterMenuCitedByItemView",function(a){a.namespace("rg.views.publicprofile"),a.rg.views.publicprofile.ProfileContributionsFilterMenuCitedByItemView=a.Base.create("publicprofile.ProfileContributionsFilterMenuCitedByItemView",a.rg.WidgetView,[],{afterRendered:function(){var b=this.get("container");b.plug(a.rg.widget.TooltipPlugin,{content:"This list is based on the publications in our database and might not be exhaustive."})}})},"1.0.0",{requires:["rg-tooltip"]});
"use strict";YUI.add("rg.views.publicprofile.ProfileCoAuthorsView",function(a){a.namespace("rg.views.publicprofile"),a.rg.views.publicprofile.ProfileCoAuthorsView=a.Base.create("publicprofile.ProfileCoAuthorsView",a.rg.WidgetView,[],{events:{".js-see-all":{click:"openDialog"}},openDialog:function(b){b.preventDefault(),this.data.preSignUpDialogContext?a.rg.loadWidgetInDialog("publictopics.PreSignUpDialog.html",{context:this.data.preSignUpDialogContext}):a.rg.loadWidgetInDialog("profile.ProfileCoAuthorsDialog.html",this.data.params)}})},"0.0.1",{requires:[]});
YUI.add("rg.views.application.PeopleItemView",function(a){a.namespace("rg.views.application"),a.rg.views.application.PeopleItemView=a.Base.create("application.PeopleItemView",a.rg.WidgetView,[],{events:{".js-hide":{click:"hideUser"},".js-show-connection":{click:"showUserConnection"},".js-unhide":{click:"unhideUser"}},afterRendered:function(){var a=this.get("container");a.on("mouseover",this.showHideLink,this),a.on("mouseout",this.hideHideLink,this),a.on("mouseover",this.showConnectionLink,this),a.on("mouseout",this.hideConnectionLink,this),this._tooltipHandling(a)},_tooltipHandling:function(b){var c=b.one(".tooltip-container");if(c){var d,e=c.getAttribute("data-tooltip-for");d="container"===e?b:b.one(e);var f=c.getAttribute("data-tooltip-align"),g=[0,0],h=c.getAttribute("data-tooltip-push-direction"),i=c.getAttribute("data-tooltip-push-amount");if(!d)return;if(a.Lang.isUndefined(f)&&(f="bottom"),!a.Lang.isUndefined(h)&&!a.Lang.isUndefined(i))switch(h){case"right":g=[parseInt(i,10),0];break;case"left":g=[-parseInt(i,10),0];break;case"top":g=[0,parseInt(i,10)];break;case"bottom":g=[0,-parseInt(i,10)]}var j={content:c.getContent(),type:"mouseenter",align:f,overlayOffset:g,arrowOffset:g,delay:200};d.plug(a.rg.widget.TooltipPlugin,j)}},safeDestroy:function(){var a=this.get("container"),b=a.one(".tooltip-container");if(b){var c,d=b.getAttribute("data-tooltip-for");c="container"===d?a:a.one(d),c&&c.tooltip&&(c.tooltip.hide(),c.tooltip.destroy(!0))}this.get("container").remove(!0)},hideUser:function(b){b.preventDefault();var c=this;a.fire("PeopleItem:HideUser",{key:this.data.accountKey,callback:function(){var a=c.get("container");a.addClass("with-overlay"),a.one(".item-content").addClass("under-overlay"),a.one(".item-overlaying").addClass("overlay"),a.one(".unhide-button-container").removeClass("hidden"),a.one(".hide-button-container").addClass("hidden")}})},unhideUser:function(b){b.preventDefault();var c=this;a.fire("PeopleItem:UnhideUser",{key:this.data.accountKey,callback:function(){var a=c.get("container");a.removeClass("with-overlay"),a.one(".item-content").removeClass("under-overlay"),a.one(".item-overlaying").removeClass("overlay"),a.one(".unhide-button-container").addClass("hidden"),a.one(".hide-button-container").removeClass("hidden")}})},showHideLink:function(){var a=this.get("container").one(".hide-button-container"),b=this.get("container").one(".unhide-button-container");a&&b&&b.hasClass("hidden")&&a.show()},hideHideLink:function(){var a=this.get("container").one(".hide-button-container"),b=this.get("container").one(".unhide-button-container");a&&b&&b.hasClass("hidden")&&a.hide()},showConnectionLink:function(){var a=this.get("container").one(".connection-button-container");a&&a.show()},hideConnectionLink:function(){var a=this.get("container").one(".connection-button-container");a&&a.hide()},showUserConnection:function(b){b.preventDefault(),a.fire("PeopleItem:ShowUserConnection",{key:this.data.accountKey})}})},"1.0.0",{requires:["rg-tooltip"]});
YUI.add("rg.views.publicliterature.PeopleItemSharedPublicationsCountView",function(a){a.namespace("rg.views.publicliterature"),a.rg.views.publicliterature.PeopleItemSharedPublicationsCountView=a.Base.create("publicliterature.PeopleItemSharedPublicationsCountView",a.rg.WidgetView,[],{events:{".js-shared-pub-count":{click:"sharedPubCountClickHandler"}},sharedPubCountClickHandler:function(){var b={sourceAccountKey:this.data.sourceAccountKey};this.data.targetAccountKey?b.targetAccountKey=this.data.targetAccountKey:b.targetAuthorUid=this.data.targetAuthorUid,a.rg.loadWidgetInDialog("literature.PublicationRelatedPublicationListDialog.html",b)}})},"1.0.0",{requires:[]});
YUI.add("rg-morebutton-plugin",function(a){a.namespace("rg.plugin"),a.rg.plugin.MoreButtonPlugin=a.Base.create("MoreButtonPlugin",a.Plugin.Base,[],{_moreHandle:null,_scrollHandler:null,initializer:function(){var a=this.get("host").one(this.get("linkSelector")),b=this.get("scrollContainerNode");this._moreHandle=a.on("click",this.loadMore,this),this.get("autoLoad")&&(b?this._createNodeScrollingUpdate(b):this._createDocumentScrollingUpdate())},destructor:function(){this.get("host").hide(),this._moreHandle.detach(),this._scrollHandler&&this._scrollHandler.detach()},loadMore:function(){this.indicateLoading(),this.get("loadMoreFunc").call(this.get("context"),this)},toggle:function(){this.get("host").toggleClass(this.get("loadMoreCss"))},indicateLoading:function(){var a=this.get("host"),b=this.get("loadMoreCss");a.hasClass(b)||a.addClass(b)},_createDocumentScrollingUpdate:function(){var b=a.one(document),c=function(){if(!this.get("host").hasClass(this.get("loadMoreCss"))){var a=b.get("docHeight"),c=b.get("docScrollY"),d=b.get("winHeight"),e=this.get("updateScrollLimit");a-(c+d)>e||this.loadMore()}};this._scrollHandler=a.on("scroll",c,window,this),c.call(this)},_createNodeScrollingUpdate:function(b){var c=function(){if(!this.get("host").hasClass(this.get("loadMoreCss"))){var a,c=b.get("offsetHeight"),d=b.get("scrollTop"),e=b.get("scrollHeight");a=e-this.get("scrollContainerNodeFactor")*c,a>=d||this.loadMore()}};this._scrollHandler=a.on("scroll",c,b,this),c.call(this)}},{NS:"moreButtonPlugin",ATTRS:{linkSelector:{value:"a"},loadMoreCss:{value:"loadmore-btn-loading"},loadMoreFunc:{value:function(){}},updateScrollLimit:{value:1800},context:{value:null},autoLoad:{value:!0},scrollContainerNode:{},scrollContainerNodeFactor:{value:2.5}}}),a.rg.plugin.scrollSpy=a.Base.create("MoreButtonPlugin",a.Plugin.Base,[],{_scrollHandler:null,initializer:function(){var b=a.one(document),c=b.get("docScrollY");this._scrollHandler=a.on("scroll",function(){var d=b.get("docScrollY");if(!(Math.abs(d-c)<this.get("threshold"))){c=d;var e=null;this.get("host").all(this.get("itemSelector")).each(function(b){!e&&a.DOM.inViewportRegion(b.getDOMNode())&&(e=b)}),e&&this.get("callback").call(this.get("context"),e)}},window,this)},destructor:function(){this._scrollHandler.detach()}},{NS:"scrollSpyPlugin",ATTRS:{itemSelector:{value:null},threshold:{value:100},callback:{value:function(){}},context:{value:null}}})},"0.0.1",{requires:[]});
YUI.add("rg-dropdown-plugin",function(a){a.namespace("rg.plugin"),a.rg.plugin.DropdownPlugin=a.Base.create("DropdownPlugin",a.Plugin.Base,[],{activator:null,menu:null,event:null,initializer:function(){var a=this.get("host");this.activator=a.one(this.get("activatorSelector")),this.menu=a.one(this.get("menuSelector")),this.event=this.activator.on("click",this._onToggle,this)},destructor:function(){this.get("host").removeClass(this.get("openClass")),this.event.detach()},_onToggle:function(a){var b=this.get("host"),c=a.target;this.get("ignoreToggle")||c.hasClass("js-ignore-dropdown-toggle")||this.get("ignoreInsideClick")&&c.ancestor(this.get("menuSelector"))&&!c.hasClass(this.get("closeDropdownClass"))||(this.event.detach(),b.hasClass(this.get("openClass"))?this._closeDropdown(a):this._openDropdown(a))},_openDropdown:function(b){this.get("ignoreLinks")&&b.preventDefault(),a.Lang.later(10,this,function(){this.event=a.one("document").on("click",this._onToggle,this),this.get("callbackOnOpen")&&this.get("callbackOnOpen").apply(this.get("callbackContext"),[this,b])});var c=this.get("host"),d=this.get("openClass");c.toggleClass(d)},_closeDropdown:function(a){this.get("ignoreLinks")&&a.preventDefault(),this.event=this.activator.on("click",this._onToggle,this),this.get("callbackOnClose")&&this.get("callbackOnClose").apply(this.get("callbackContext"),[this,a]);var b=this.get("host"),c=this.get("openClass");b.toggleClass(c)}},{NS:"dropdownPlugin",ATTRS:{activatorSelector:{value:".dropdown-toggle"},menuSelector:{value:".dropdown-menu"},openClass:{value:"dropdown-open"},ignoreInsideClick:{value:!1},callbackOnOpen:{value:null},callbackOnClose:{value:null},callbackContext:{value:this},closeDropdownClass:{value:"js-close-dropdown"},ignoreToggle:{value:!1},ignoreLinks:{value:!1}}})},"0.0.1",{requires:["transition"]});
YUI.add("rg-custom-scrollbar",function(a){a.namespace("rg.plugins"),a.rg.plugins.CustomScrollbar=a.Base.create("CustomScrollbar",a.Plugin.Base,[],{initializer:function(){var b=this.get("host"),c="<div></div>";b.setStyles({overflowY:"hidden"});var d=a.Node.create(c);d.setStyles({width:b.get("offsetWidth"),height:b.get("offsetHeight"),position:"relative",overflowY:"hidden"}),d.addClass("scroll-wrapper");var e=a.Node.create(c);e.setStyles({backgroundColor:"#ccc",opacity:this.get("hideScrollbar")?0:1,width:"7px",zIndex:"10",position:"absolute",right:"1px",top:0,borderRadius:"5px"}),e.addClass("scroll-bar");var f=a.Node.create(c);f.setStyles({width:e.get("offsetWidth"),height:"100%",position:"absolute",top:0,right:"1px"}),b.wrap(d),d.append(e),d.append(f);var g=new a.DD.Drag({node:e}).plug(a.Plugin.DDConstrained,{constrain:d,stickY:!0});g.on("drag:drag",function(){this.set("showScrollbar",!0),this.handleScrollbarMove()},this),g.on("drag:start",function(){this.set("showScrollbar",!0)},this),g.on("drag:end",function(){this.set("showScrollbar",!1)},this),this.after("showScrollbarChange",function(a){a.newVal?this._showScrollbar():this._hideScrollbar()}),this.set("wrapper",d),this.set("scrollbar",e),this._setScrollbarHeight(),this.attachMouseWheel();var h=b.on("scroll",function(){this.handleScroll()},this);this.set("_scrollHandler",h),e.on("mousedown",function(){this.get("_scrollHandler").detach()},this),a.one("document").on("mouseup",function(){this.set("_scrollHandler",h)},this),d.on("mouseover",function(){this.set("showScrollbar",!0)},this),d.on("mouseenter",this._handleMouseOver,this),d.on("mouseleave",this._handleMouseOut,this),this.get("hiddenScrollbarOpacity")>0&&this._handleMouseOut()},handleHostResize:function(){var a=this.get("host");this.get("wrapper").setStyles({width:a.get("offsetWidth"),height:a.get("offsetHeight"),position:"relative",overflowY:"hidden"}),this._setScrollbarHeight(),this.handleScroll()},_handleMouseOver:function(){this.set("showScrollbar",!0);var a=this.get("host");this.set("_mouseOverContainer",!0),a.get("offsetHeight")>=a.get("scrollHeight")||this._showScrollbar()},_handleMouseOut:function(){this.set("showScrollbar",!1),this.set("_mouseOverContainer",!1),this._hideScrollbar()},_hideScrollbar:function(){if(this.get("hideScrollbar")){var b=this.get("hideScrollbarDelay");this.get("_hideScrollbarTimer")&&this.get("_hideScrollbarTimer").cancel(),this.set("_hideScrollbarTimer",a.later(b,this,function(){this.get("wrapper").getDOMNode()&&this.get("wrapper").removeClass("hover"),this.get("scrollbar").getDOMNode()&&this.get("scrollbar").transition({easing:"linear",duration:.3,opacity:this.get("hiddenScrollbarOpacity")})},[],!1))}},_showScrollbar:function(){this.get("hideScrollbar")&&(this.get("wrapper").addClass("hover"),this.get("_hideScrollbarTimer")&&this.get("_hideScrollbarTimer").cancel(),this.get("scrollbar").transition({easing:"linear",duration:.3,opacity:1}))},handleScroll:function(){var a=this.get("scrollbar"),b=this.get("host"),c=b.get("scrollTop")/(b.get("scrollHeight")-b.get("offsetHeight")),d=c*(b.get("offsetHeight")-a.get("offsetHeight"));this.moveScrollbar(d)},handleScrollbarMove:function(){var a=this.get("scrollbar"),b=this.get("host"),c=this.get("scrollToFn"),d=parseInt(a.get("offsetTop"))/(b.get("offsetHeight")-a.get("offsetHeight")),e=d*(b.get("scrollHeight")-b.get("offsetHeight"));c.call(this,e)},_setScrollbarHeight:function(){var a=this.get("host"),b=a.get("offsetHeight")/a.get("scrollHeight")*a.get("offsetHeight"),c=Math.max(b,this.get("minScrollbarHeight"));return this.get("scrollbar").setStyles({height:c}),c},moveScrollbar:function(a){var b=this.get("host"),c=this.get("scrollbar");a=Math.max(a,0);var d=b.get("offsetHeight")-c.get("offsetHeight");a=Math.min(a,d),this.get("scrollbar").setStyles({top:a})},_onWheel:function(a){if(this.get("_mouseOverContainer")){var b=-a.wheelDelta/120,c=this.get("scrollbar").get("offsetTop")+b*this.get("scrollWheelStep");this.moveScrollbar(c),this.handleScrollbarMove(),a.preventDefault&&a.preventDefault(),a.returnValue=!1}},attachMouseWheel:function(){a.on("mousewheel",this._onWheel,this)}},{NS:"CustomScrollbar",ATTRS:{wrapper:{value:null},scrollWheelStep:{value:500},minScrollbarHeight:{value:30},scrollbar:{value:null},scrollToFn:{value:function(a){this.get("host").set("scrollTop",a)}},hideScrollbar:{value:!0},hideScrollbarDelay:{value:500},_mouseOverContainer:{value:!1},_hideScrollbarTimer:{value:null},_scrollHandler:{value:null},showScrollbar:{value:!1},hiddenScrollbarOpacity:{value:0}}})},"0.0.1",{requires:["event-mousewheel","dd-constrain"]});
"use strict";YUI.add("rg.views.application.AbstractPeopleListContainerView",function(a){a.namespace("rg.views.application"),a.rg.views.application.AbstractPeopleListContainerView=a.Base.create("application.AbstractPeopleListContainerView",a.rg.WidgetView,[],{events:{".js-see-all":{click:"_seeAll"},".js-see-all-login":{click:"seeAllLogin"},".js-invite":{click:"invite"},".js-load-more-list":{click:"loadMoreList"},".js-close":{click:"close"},global:{profileFollowed:"onProfileFollowed","teaserCompact:seeAll":"_seeAll","AuthorInviteButton:openingInviteDialog":"close"}},afterRendered:function(){var b=this.get("container"),c=b.one(".loadmore-btn");c&&c.plug(a.rg.plugin.MoreButtonPlugin,{loadMoreFunc:this.loadMore,context:this}),b.one(".peopleListSorting")&&this.bindSorting();var d=this.get("loadedEntries");b.all(".js-list-item").each(function(a){var b=a.getData("account-key");d.push(b)}),this.set("loadedEntries",d),this.set("listLength",d.length),this.get("loadMoreList")&&this.once("preloaded",function(){this.get("preLoadedEntries").length>0&&this.get("container").one(".js-load-more-list").show("fadeIn")},this),this.preLoadMoreSuggestions()},bindSorting:function(){var b=this.get("container"),c=b.one(".peopleListSorting");c.plug(a.rg.plugin.DropdownPlugin,{})},getAccountKeysFromList:function(){var a=[];return this.get("container").all(".js-list-item").each(function(b){a.push(b.getData("account-key"))}),a},loadMore:function(b){var c=this.get("loadMoreEntryLimit");if(c){var d=this.get("container"),e=d.one(".js-people-list-content");if(e&&e.get("children").size()>=c)return void a.Lang.later(0,null,function(){d.one(".loadmore-btn").unplug(a.rg.plugin.MoreButtonPlugin)})}var f={offset:this.data.nextOffset};this.get("sendIgnoredAccountsOnLoadMore")&&(f.ignoredAccountKeys=this.getAccountKeysFromList()),a.rg.ajax(this.data.loadMoreAction,f,function(c){if(!c.success)return void b.toggle();var d=this.get("container");if(d){var e=d.one(".js-people-list-content");this.data.nextOffset=c.result.data.nextOffset,(null!=c.result.data.content&&!c.result.data.content.data.hasMore||null==c.result.data.content&&!c.result.data.hasMore)&&this.get("container").one(".loadmore-btn").unplug(a.rg.plugin.MoreButtonPlugin);var f=c.result.data.content.data.listItems,g=[];if(f){a.Array.each(f,function(a){a&&g.push(a)});var h=g.length,i=0,j=function(){h>i||a.Lang.later(50,null,function(){b.toggle()})};a.Array.each(g,function(b){a.rg.createWidget(b,function(a){a.render({append:e,afterRendered:function(){i++,j()}})})})}}},this,{},this.data.loadMoreMethod)},_seeAll:function(b){b.preventDefault();var c=b.currentTarget;c.hasClass("disabled")||(c.addClass("disabled"),a.rg.loadWidgetInDialog(this.data.seeAllDialogUrl,{limit:10},function(b){var d=b,e=d.one(".js-dialog-list-container"),f=d.one(".js-people-list-content");e&&f&&parseInt(f.getStyle("height"),10)>400&&(e.setStyle("height","400px"),e.plug(a.rg.plugins.CustomScrollbar,{})),c.removeClass("disabled")},this))},seeAllLogin:function(b){this.data.preSignUpDialogContext&&(b.preventDefault(),a.rg.loadWidgetInDialog("publictopics.PreSignUpDialog.html",{context:this.data.preSignUpDialogContext}))},invite:function(){a.rg.loadWidgetInDialog(this.data.inviteDialogUrl,{},function(){},this)},getFollowNodeData:function(a){var b={accountKeys:[]};return this.get("container").all(".js-list-item").each(function(c){var d=c.getData("account-key");d&&(b.accountKeys.push(d),d==a&&(b.followedNode=c))}),b},onProfileFollowed:function(b){var c=b.key,d=this.get("preLoadedEntries");if(d&&!(d.length<=0)){var e=d.shift(),f=this.getFollowNodeData(c),g=f.followedNode;this.set("preLoadedEntries",d),a.Lang.later(500,this,function(){this.renderFollowItem(g,e)})}},renderFollowItem:function(b,c){if(b){var d=this;a.rg.createWidget(c,function(a){b.transition({opacity:0,duration:.5},function(){a.render({before:function(a){a.setStyle("opacity",0)},replace:b,after:function(a){a.transition({opacity:1,duration:.5}),d.preLoadMoreSuggestions()}})})})}},preLoadMoreSuggestions:function(){var b=this.get("preLoadMoreSuggestionsUrl");if(b){var c=this.get("loadedEntries"),d=this.get("preLoadedEntries"),e=this.get("listLength"),f=this.get("loadNextFactor");if(!(d.length>e*f||this.get("isPreLoading"))){this.set("isPreLoading",!0);var g=this.get("preLoadMoreSuggestionsParams");g.ignoredAccountKeys=c,a.rg.ajax(b,g,function(a){if(a.success&&a.result.widgets&&a.result.accountKeys){var b=this.get("loadedEntries"),c=this.get("preLoadedEntries");b=b.concat(a.result.accountKeys),this.set("loadedEntries",b),c=c.concat(a.result.widgets),this.set("preLoadedEntries",c),this.set("isPreLoading",!1),this.fire("preloaded")}},this)}}},loadMoreList:function(b){b.preventDefault();var c=b.currentTarget;this.get("isLoadingMoreList")||(this.set("isLoadingMoreList",!0),this.get("container").all(".js-list-item").each(function(b){var c=this.get("preLoadedEntries"),d=c.shift();this.set("preLoadedEntries",c),d&&a.Lang.later(500,this,function(){this.renderFollowItem(b,d)})},this),a.Lang.later(2e3,this,function(){return this.get("preLoadedEntries").length<=0?void c.hide("fadeOut"):void this.set("isLoadingMoreList",!1)}))},close:function(a){if(a){a.preventDefault();var b=this.get("container");b.hide("fadeOut",function(){b.remove(!0)})}else this.dialog&&this.dialog.hide()}},{ATTRS:{isPreLoading:{value:!1},preLoadMoreSuggestionsUrl:{},preLoadMoreSuggestionsParams:{value:{}},preLoadedEntries:{value:[]},loadedEntries:{value:[]},listLength:{value:0},loadNextFactor:{value:1.5},loadMoreList:{value:!1},isLoadingMoreList:{value:!1},sendIgnoredAccountsOnLoadMore:{value:!1},loadMoreEntryLimit:{}}})},"1.0.0",{requires:["rg-morebutton-plugin","rg-dropdown-plugin","rg-custom-scrollbar","transition"]});
YUI.add("rg.views.publicprofile.ProfileFollowingWidgetView",function(a){a.namespace("rg.views.publicprofile"),a.rg.views.publicprofile.ProfileFollowingWidgetView=a.Base.create("publicprofile.ProfileFollowingWidgetView",a.rg.views.application.AbstractPeopleListContainerView,[],{initializer:function(){this.events[".js-forward"]={click:"forwardTo"},this.once("rendered",this.attachAppendItemsAfterFollowed,this)},destructor:function(){this.appendItemsAfterFollowedHandle&&this.appendItemsAfterFollowedHandle.detach()},forwardTo:function(b){b.preventDefault(),a.rg.utils.url.forwardTo("browse.BrowseSuggestResearcher.html?ev=prf_flw_promo")},attachAppendItemsAfterFollowed:function(){this.get("appendItemsAfterFollowed")&&(this.appendItemsAfterFollowedHandle=a.on("profileFollowed",this.showFollowedProfile,this))},showFollowedProfile:function(b){if(this.get("appendItemsAfterFollowed")){var c=b.key,d=this.get("container"),e=this.get("container").one(".js-people-list-content");if(!e)return this.set("appendItemsAfterFollowed",!1),void this.reload();var f=d.one(".js-facepile-headline-count"),g=parseInt(f.getContent());this.get("currentUsersProfile")&&f.setContent(g+1),g>=this.get("displayLimit")||a.rg.loadWidget(this.widgetUrl,{displayAccountKey:c},function(b){if(b.success){var c=b.data.content.data.listItems;if(0!==c.length){var d=c.pop(),e=this.get("container").one(".js-people-list-content");a.rg.createWidget(d,function(a){a.render({append:e})},this)}}},this)}}},{ATTRS:{appendItemsAfterFollowed:{value:!1},displayLimit:{value:0},currentUsersProfile:{value:!1}}})},"1.0.0",{requires:["rg.views.application.AbstractPeopleListContainerView","rg-utils-url"]});
YUI.add("rg.views.application.PeopleListTeaserCompactView",function(a){a.namespace("rg.views.application"),a.rg.views.application.PeopleListTeaserCompactView=a.Base.create("application.PeopleListTeaserCompactView",a.rg.WidgetView,[],{events:{".js-see-all":{click:"seeAll"}},seeAll:function(b){a.fire("teaserCompact:seeAll",b)}})},"1.0.0",{requires:["rg-tooltip"]});