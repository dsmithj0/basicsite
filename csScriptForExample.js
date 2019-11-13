
var otcsticket = "";
var fileName = "";
var folderName = "";
var csAddress = "http://vm-dsmithjo.westeurope.cloudapp.azure.com/otcs/cs.exe/"

$(document).ready(authenticate())
/*
 * This function needs to be run first to authenticate the user against Content Server.
 */
function authenticate() {
	// Set up the ajax request
	$.ajax({
		// Authenticate is a POST
		type: "POST",
		url: "http://vm-dsmithjo.westeurope.cloudapp.azure.com/otcs/cs.exe/api/v1/auth",
		data: { username: "Admin", password: "OpenText1" },
		beforeSend: function( xhr ) {
			// Set the correct MimeType for the request.
			xhr.overrideMimeType( "application/x-www-form-urlencoded" )
		}
	}).done( function( data ) {
		if ( console && console.log ) {
			var val = JSON.parse( data );
			console.log( "setting otcsticket to: " + val[ "ticket" ] );
			// Store the ticket for later use.
			otcsticket = val[ "ticket" ];
			//document.getElementById( 'ticket' ).innerHTML = otcsticket;
			// document.getElementById( 'ticket' ).innerHTML = "Authentication Complete";
			pageLoadAndSearch();
		}
	});
}

function normalSearch(){
	console.log("Searching");
	var searchTerm = $("#query").val()
	// alert("Text: " + searchTerm);
	$("#searchBox").attr("action",csAddress+"app/search/where/"+searchTerm);

}
function advancedSearch() {
	console.log("advanced");
		var searchTerm;
	var rawWords = $("#rawWords").val();
	if(rawWords!=""){
		searchTerm = rawWords;
	}
	var subDocType = $("#subDocType").val();
	if(subDocType.length > 0 ){
		searchTerm += " and OTSubType:"+subDocType ;
	}
	// var segment =  $("#segment").val();
	// var subsegment =  $("#subSegment").val();
	// var process =  $("#processSupported").val();
	// var terms = [rawWords,subdoctype, segment, subsegment, process];

console.log(searchTerm);
	$("#advancedSearch").attr("action",csAddress+"app/search/where/"+searchTerm);
}

function pageLoadAndSearch(){
	var thisPage = document.location.href.substr(document.location.href.lastIndexOf('/') + 1);
	if(thisPage.includes("index")){
		console.log("Do the index page search");
		var searchArray = {"Attr_26237_3":"Asia"};
		searchDocuments("index",searchArray);
	}else if(thisPage.includes("report")){

		var nodeID = getQueryString('nodeID');
		changeContentInViewer(nodeID)
		// viewCategoryDetails(4399493);

	}else{
		console.log("This is the "+thisPage+ " page.");
	}
}
/**
 * Get the value of a querystring
 * @param  {String} field The field to get the value of
 * @param  {String} url   The URL to get the value from (optional)
 * @return {String}       The field value
 */
var getQueryString = function ( field, url ) {
	var href = url ? url : window.location.href;
	var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
	var string = reg.exec(href);
	return string ? string[1] : null;
};

function dropDownSearch(searchTerm){
	searchDocuments("index",{"Attr_26237_3":searchTerm});
}

/*
 * This function will search using a search query.
 */
function searchDocuments(caller, searchTerms) {
	// Manually create a FormData object.
	var fd = new FormData();
	// Add the required MetaData

	whereClause = "OTSubType: '144'";
	for (var key in searchTerms){
	// 	// whereClause += " and Attr_26237_3:'Asia'";
		whereClause += " and "+key+":'"+searchTerms[key]+"'";
	}
	// fd.append( "where", "OTSubType: 144" );
	//fd.append( "where", "Attr_26237_2:'Automotive'");
	// fd.append( "where", "Attr_26237_3:'Asia'");
	fd.append( "where", whereClause );
	//fd.append( "query_id", "3294756" );
	//fd.append( "metadata", "true");
	console.log( "otcsticket is: " + otcsticket );
	//console.log( "folderId is: " + folderId.value );
	//var nodeID = folderId.value;
	var dataHere = $.ajax({
		// POST to /api/v1/nodes
		type: "POST",
		url: "http://vm-dsmithjo.westeurope.cloudapp.azure.com/otcs/cs.exe/api/v2/search",
		// Our data is the FormData object we set up above.
		data: fd,
		contentType: false,
		processData: false,
		beforeSend: function( xhr ) {
			// Add the ticket from the Autheticate function to the request header.
			xhr.setRequestHeader( "otcsticket", otcsticket ),
			// Update the MimeType as required.
			xhr.overrideMimeType( "multipart/form-data" )
		}
		}).done(function( data ) {
			console.log( "we're in the search here" );
			if(caller == "index"){
				console.log("search caller is index");
				displayResults("promoted",data);
			}else{
				console.log("caller is not index");
				console.log("search caller isNOT index, so we just return the object: "+data);
				console.log(JSON.parse(data));
				displayResults("related",data);
				//return JSON.parse(data);
			}

		}).fail(function( request, statusText ) {
			console.log( statusText );
		});
console.log("do i have access to data?"+dataHere);
return dataHere;
}
/*
 *This function displays the results when given raw JSON from a search -->
 */

function displayResults(resultSection, data)	{
	var dataParsed = JSON.parse(data);
	var time = new Date();
	var timeString = time.getHours() +":"+ time.getMinutes()+":"+time.getSeconds();
	var nodeIDs = [];
	position = '#'+resultSection+'Contents';
	console.log(dataParsed);
	$("#"+resultSection+"Contents").empty();
	//$('#tblsearchDocumentsTable tbody:last').append('<tr><th>Time Complete: '+timeString+'</th></tr>');

	for (i =0; i<dataParsed.results.length; i++){
		nodeIDs.push(dataParsed.results[i].data.properties.id);
		var itemName = dataParsed.results[i].data.properties.name;
		var itemSummary = dataParsed.results[i].data.properties.short_summary;
		var itemParent = dataParsed.results[i].links.parent.name;
		var lastModifiedBackwards = dataParsed.results[i].data.properties.modify_date;
		var lastModified = lastModifiedBackwards.substr(8,2) + "-" + lastModifiedBackwards.substr(5,2) + "-" + lastModifiedBackwards.substr(0,4);

		console.log(i+" "+itemName+" "+nodeIDs[i]);
		//document.getElementById( 'lblsearchDocuments' ).innerHTML = dataParsed.results[i].links.parent.name;
		//$('#tblsearchDocumentsTable tr:last').after('<tr><td id=\'resultThumb['+i+']\'></td><td>'+itemName+'</td><td>'+itemSummary+'</td></tr>');
		// $('#promotedPane h5:last').after('<img src =\"' + getThumbnail(nodeIDs[i]) + '\"><p><a href=\"http://enterprise/otcs/llisapi.dll?func=doc.ViewDoc&nodeid=' +nodeIDs[i]+'">'+ itemName + '</a><br/><small>Modified: ' + lastModified.substring(0,10) + ' | ' + itemParent + '</small><p><hr/>');
		// if(i==0){
			// position = '#'+resultSection+'Pane h5:last'

		// }else{
			// position = '#'+resultSection+'Pane hr:last';
		// }
		var sectionImageDiv = ""+resultSection+"Image"+""+i;
		// var linkToDocument = '<a href=\"http://enterprise/otcs/llisapi.dll?func=doc.ViewDoc&nodeid=' +nodeIDs[i]+'">'+ itemName + '</a>';
		// var linkToDocument = '<a href=\"http://enterprise/otcs/llisapi.dll?func=doc.ViewDoc&nodeid=' +nodeIDs[i]+'">'+ itemName + '</a>';
		var loadDocumentButton = 'onClick=goToDocumentPage('+nodeIDs[i]+')';

		var thisPage = document.location.href.substr(document.location.href.lastIndexOf('/') + 1);
		if(thisPage.includes("report")){
			loadDocumentButton = 'onClick=changeContentInViewer('+nodeIDs[i]+')';
		}

		console.log(sectionImageDiv);
		$(position).append('<div class="media documentListDiv"'+loadDocumentButton+'><div id=\"'+sectionImageDiv+'\"></div><div class="media-body"> '+itemName+'<br/><small>Mod: ' + lastModified.substring(0,10) + ' | ' + itemParent + '</small></div></div><hr />');
		// $('#promotedPane h5:last').after('<p><a href=\"http://enterprise/otcs/llisapi.dll?func=doc.ViewDoc&nodeid=' +nodeIDs[i]+'">'+ itemName + '</a><br/><small>Modified: ' + lastModified.substring(0,10) + ' | ' + itemParent + '</small><p><hr/>');

		// var nameOfImage = "promotedImage"+i;
		// document.getElementById( nameOfImage ).appendChild(getThumbnail(nodeIDs[i]));
		// var thumbImage = getThumbnail(nodeIDs[i]);
		// console.log(thumbImage +""+ i);
		getThumbnail(resultSection,nodeIDs[i], i)
	}
	console.log(nodeIDs);
	// for (i =0; i<dataParsed.results.length; i++){

	// console.log("getting thumbnail: "+i);
	// getThumbnail(nodeIDs[i], i)
	// }
}
function goToDocumentPage(nodeID){
	goToPage("report.html?nodeID="+nodeID);
}
function goToPage(url){
	document.location.href = url;
}
/*
 * This takes a set of nodeIDs and returns the thumbnail addresses for them
 */
function getThumbnail(resultSection, nodeID, index)	{
	var thumnailAddress;

	// Manually create a FormData object.
	var fd = new FormData();
	// Add the required MetaData

	console.log( "otcsticket is: " + otcsticket );
	//console.log( "folderId is: " + folderId.value );
	//var nodeID = folderId.value;

	$.ajax({
		// POST to /api/v1/nodes
		type: "GET",
		url: "http://vm-dsmithjo.westeurope.cloudapp.azure.com/otcs/cs.exe/api/v1/nodes/" + nodeID + "/thumbnails/medium/content",

		// Our data is the FormData object we set up above.
		data: fd,
		contentType: false,
		xhrFields:{
                responseType: 'blob'
            },
		//dataType: "blob",

		processData: false,
		beforeSend: function( xhr ) {
			// Add the ticket from the Authenticate function to the request header.
			xhr.setRequestHeader( "otcsticket", otcsticket )//,
			// xhr.responseType= 'blob';
			// Update the MimeType as required.
			//xhr.overrideMimeType( "multipart/form-data" )
		}
		}).done(function( data ) {

			var thumbImage = new Image();
			var binaryData = [];

			binaryData.push(data);
			var url = window.URL || window.webkitURL;
			thumbImage.src = window.URL.createObjectURL(new Blob(binaryData, {type: "image/jpeg"}))
			 var divName = ''+resultSection+'Image'+''+index ;
			console.log("getting div id: "+ divName);
			// thumbImage.className("img-thumbnail");
			thumbImage.id=(divName+"thumb");
			thumbImage.width=70;

			document.getElementById(divName).appendChild(thumbImage);
			 // $("#"+divName).addClass("img-thumbnail");
			$("#"+divName+"thumb").addClass("img-thumbnail");

			console.log(thumbImage);
			// return thumbImage;
		}).fail(function( request, statusText ) {
			console.log( "ERROR in getThumbnail: "+request+ ": "+statusText );
			//console.log(request);
		});
}

/* CORS STUFF NOT NEEDED FOR NOW

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
}
	// Manually create CORS request
	// var xhr = createCORSRequest('GET', url);
	// if (!xhr) {
	  // throw new Error('CORS not supported');
	// }
 */


			/*
 * This function will add a category to a folder to Content Server and print out the added NodeID to the console.
 */
function searchVolumes() {
	// Manually create a FormData object.
	var fd = new FormData();
	// Add the required MetaData

   // fd.append( "id", "2268798" );
	fd.append( "where_type", "144" );
	console.log( "otcsticket is: " + otcsticket );
	//console.log( "folderId is: " + folderId.value );
	var nodeID = folderId.value;
	$.ajax({
		// POST to /api/v1/nodes
		type: "GET",
		url: "http://vm-dsmithjo.westeurope.cloudapp.azure.com/otcs/cs.exe/api/v1/volumes/141/nodes",
		// Our data is the FormData object we set up above.
		data: fd,
		contentType: false,
		processData: false,
		beforeSend: function( xhr ) {
			// Add the ticket from the Autheticate function to the request header.
			xhr.setRequestHeader( "otcsticket", otcsticket ),
			// Update the MimeType as required.
			xhr.overrideMimeType( "multipart/form-data" )
		}
		}).done(function( data ) {
			console.log( data );
		}).fail(function( request, statusText ) {
			console.log( statusText );
		});
}

function getFilename()
{
	var thefile = document.getElementById('fileToUpload');
	fileName = thefile.value.replace("C:\\fakepath\\", "");
	//alert(thefile.value.replace("C:\\fakepath\\", ""));
}

function getFoldername()
{
	folderName = document.getElementById('folderName').value;
	//alert(thefile.value.replace("C:\\fakepath\\", ""));
}

/*
 * This function will show a category and print out the results to the console.
 */
function viewCategoryDetails(nodeID) {
	// Manually create a FormData object.
	console.log("Category details being searched");
	var fd = new FormData();
	// Add the required MetaData

   // fd.append( "id", "2268798" );
   // fd.append( "category_id", "2268687" );
	console.log( "otcsticket is: " + otcsticket );
//				console.log( "folderId is: " + folderId.value );
//				var nodeID = folderId.value;
	//var nodeID = 4399493;
	$.ajax({
		// POST to /api/v1/nodes
		type: "GET",
                   url: "http://vm-dsmithjo.westeurope.cloudapp.azure.com/otcs/cs.exe/api/v2/nodes/" + nodeID + "/categories/4399490",
		// url: "http://vm-dsmithjo.westeurope.cloudapp.azure.com/otcs/cs.exe/api/v2/nodes/" + nodeID + "/categories",
		// Our data is the FormData object we set up above.
		data: fd,
		contentType: false,
		processData: false,
		beforeSend: function( xhr ) {
			// Add the ticket from the Autheticate function to the request header.
			xhr.setRequestHeader( "otcsticket", otcsticket ),
			// Update the MimeType as required.
			xhr.overrideMimeType( "multipart/form-data" )
		}
	}).done(function( data ) {
		console.log("View category Details");
			var categoriesObject = JSON.parse(data);
			$("#tblRelatedPeople tbody").empty();
			console.log( categoriesObject );
			var i =1;
			var numberOfRelatedPeople = 4;
			// var poleIndex = getPOLEIndex(data);
			// var loadRelatedDocumentsButton = 'onClick=relatedDocSearch('+nodeIDs[i]+')';
			//TODO keep going till there are no more left OR we hit 4 (which is enough)
			for(var i=1; i<=numberOfRelatedPeople; i++){
				//TODO need to find how to tell which is the POLE category -  is the category in some way
				var name = categoriesObject.results.data.categories["4399490_2_" + i + "_3"];
				if (typeof name === "undefined"){
					break;
				}
				var nameRel = categoriesObject.results.data.categories["4399490_2_" + i + "_4"];
				var loadRelatedDocumentsButton = 'onClick=\"relatedDocSearch(\''+name+'\')\"';
				$('#tblRelatedPeople tbody:last').append('<tr><td><a href="#" '+loadRelatedDocumentsButton+'>' + name + '</a></td><td>' + nameRel + '\%</td></tr>');
			}
			i=1;
			numberOfReplatedPlaces = 4;
			$("#tblRelatedPlaces tbody").empty();
			for(var i=1; i<=numberOfReplatedPlaces; i++){
				var place = categoriesObject.results.data.categories["4399490_5_" + i + "_6"];
				if (typeof place === "undefined"){
					break;
				}
				var placeRel = categoriesObject.results.data.categories["4399490_5_" + i + "_7"];
				$('#tblRelatedPlaces tbody:last').append('<tr><td><a href=\"#\">' + place + '</a></td><td>' + placeRel + '\%</td></tr>');
			}

		}).fail(function( request, statusText ) {
			console.log( statusText );
		});
}

function relatedDocSearch(searchTerm){
	var searchArray = {"Attr_4399490_3":searchTerm};
	console.log("Back in relatedDocSearch "+searchArray);
	var data = searchDocuments(false, searchArray);
	console.log(data);
	var results = JSON.parse(data);
	console.log(results);
}

function displayInEmbeddedViewer(viewerMode){
	// document.getElementById("viewerFrame").style.width = document.getElementById("mainDivDefault").style.width;
	// document.getElementById("viewerFrame").style.height = document.getElementById("mainDivDefault").style.height;
	hideShowDiv("mainDivDefault", !viewerMode);
	hideShowDiv("viewerPane", viewerMode);
	hideShowDiv("hideViewerButton", viewerMode);

}

function changeContentInViewer(nodeID){
	//displayInEmbeddedViewer(true);
	var source = "http://enterprise/otcs/cs.exe?func=doc.viewdoc&nodeid="+nodeID;
	$('#viewerFrame').attr("src",source);

	viewCategoryDetails(nodeID);
}

function hideShowDiv(divName, makeVisible) {
	var x = document.getElementById(divName);
	if (makeVisible) {
		// x.style.visibility = "visible";
		x.style.display = "block";
		x.style.opacity = 1;
	} else {
		// x.style.visibility = "hidden";
		x.style.display = "none";
		x.style.opacity = 0;
	}
}

// csui.require([
			// 'csui/lib/marionette',
			// 'csui/utils/contexts/page/page.context',
			// 'csv/widgets/csviewer/csviewer.view',
			// 'csui/utils/contexts/factories/node'
		// ], function(Marionette, PageContext, CSViewerView, NodeModelFactory) {

			// var context = new PageContext(),
				// nodeid = `%Lparams.nodeid`,
				// vernum = `%Lparams.version`,
				// model = (!!nodeid)?context.getModel(NodeModelFactory, {
		                // attributes: {
		                    // id: nodeid,
		                    // version_number: vernum || undefined,
		                    // vertype: `%L(Length(.fData.vertype)>0)?'"' + .fData.vertype + '"':'undefined'`
		                // }
		            // }):undefined,
				// view = new CSViewerView({
					// context: context,
					// model: model,
					// locale: `%L(Length(.fData.locale)>0)?'"' + .fData.locale + '"':'undefined'`,
					// dumbui: true
				// }),
				// region = new Marionette.Region({
					// el: '#viewerPane'
				// });

			// region.show(view);

			// view.on('destroy', function() {
                // var nexturl = (""+window.location).match('&nexturl=[^&]*');
                // if(nexturl && nexturl.length > 0)
                    // nexturl = nexturl[0].split('=');
                // if(nexturl && nexturl.length > 0)
                    // nexturl = decodeURIComponent(nexturl[1]);
                // if(nexturl && nexturl.length > 0)
                    // window.location = nexturl;
                // else {
                    // var jumpsize = -1 - ((view.closeDisp=='normal')?1:0);
                    // history.go(jumpsize);
                // }
			// });
		// });
