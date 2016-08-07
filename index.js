'use strict';
var request = require('request');
var cheerio = require('cheerio');
var co = require('co');
var Excel = require('exceljs');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('HP Ink And Toner');
var _ = require('lodash');
var BaseUrl = "http://www.hpshopping.in/Ink_and_Toner/Ink_Cartridges";
var MainUrl = "http://www.hpshopping.in";

worksheet.columns = [
    { header: "URL", key: "url", width: 30 },
    { header: "Title", key: "title", width: 20 },
    { header: "Features", key: "features", width: 30 },
    { header: "Images", key: "imageUrls", width: 30 },
    { header: "MRP", key: "price", width: 15 },
    { header: "Description", key: "description", width: 30 },
    { header: "Brand", key: "Actors", width: 15 },
	{ header: "Model Number", key: "Directors", width: 15 },
	{ header: "Colour", key: "Language", width: 15 },
	{ header: "Grip Type", key: "Subtitles", width: 15 },
	{ header: "Material", key: "Region", width: 15 },
	{ header: "Size", key: "numberOfDiscs", width: 15 },
	{ header: "Manufacturer Part Number", key: "Studio", width: 15 },
	{ header: "Item Height", key: "releaseDate", width: 15 },
	{ header: "Item Length", key: "Format", width: 15 },
	{ header: "Ink Colour", key: "Rated", width: 15 },
	{ header: "Item Width", key: "Rated1", width: 15 },
	{ header: "Item Weight", key: "runTime", width: 15 },
	{ header: "Sheet Size", key: "sheetSize", width: 15 },
    { header: "Specifications", key: "specifications", width: 30 },
    { header: "Path", key: "path", width: 30 },
    { header: "Keywords", key: "keywords", width: 30 }
];

function FetchCategoryFeatures(urls){
	co(function*(){
		var url1 = urls ;
		const promise = new Promise((resolve, reject) => {
			request(url1 , function(err,resp,body){
				var $ = cheerio.load(body);
				var url = url1;

				var price = $('label#lblprice').text();
				var imageUrls = $('li.easyzoom').first().next().attr('src');
				var Actors = "HP";
				var Directors1 = $('div.prdt_details_top h4').text();
				var Directors2 = Directors1.split(':');
				var Directors3 = Directors2[1];
				
				//var Directors = Directors3.splice(lenn-1,1);
				var Directors4 = Directors3.trim();
				var lenn = Directors4.length ;
				var Directors = Directors4.slice(0,lenn - 2);
				var title =$('div.prdt_details_top h3').text().trim();
				
				var path = "";
		    	$('div.breadcrumbs li').each(function (i, li) {
		    		if(!$(li).hasClass('breadcrumbs')) {
						path += $(li).text().trim() + " | ";
					}
				});

				var keywords = $('meta[name=KeyWords]').attr('content');
				var description = title ;
				var Language,Region,Format,releaseDate,specifications,sheetSize,runTime,Rated1,Rated,Studio,numberOfDiscs,Subtitles,features ;
				//console.log(Directors);

				var saveObject = {
			      	url : url1, title : title, features : features, imageUrls : imageUrls, price : price, description : description, 
					Actors : Actors, Directors : Directors, Language : Language, Subtitles : Subtitles, Region : Region, 
					numberOfDiscs : numberOfDiscs, Studio : Studio, releaseDate : releaseDate, Format : Format, Rated : Rated, Rated1 : Rated1, runTime : runTime, sheetSize : sheetSize,
					specifications : specifications, path : path, keywords : keywords

			    };	

			    // console.log(saveObject);
			    resolve(saveObject);	
			})
		});

		const fetchedObject = yield Promise.resolve(promise);
		console.log(fetchedObject);
		if(fetchedObject.title && fetchedObject.url && fetchedObject.imageUrls && fetchedObject.Actors && fetchedObject.keywords && fetchedObject.Directors&& fetchedObject.path && fetchedObject.price && fetchedObject.description ){
	    	worksheet.addRow(fetchedObject).commit();
		}
	    	
	    yield workbook.xlsx.writeFile("HP_INK_AND_TONER.xlsx").then(function() {
	    	console.log("Row added & Saved");
	    });
	})

}


function FetchUrls(){
	co(function*(){
		// request(BaseUrl,function(err,resp,body){
		// 	var $ = cheerio.load(body);
   			// var body = { vRefTypeName: 'Ink_and_Toner', vCurrentPage: '1', vTabbedPanel: '4', vFilterValues:"Ink_Cartridges", vSearch: '', vStoreName: 'STORE' , vItemTotal : '168'};
      //       request.post("http://www.hpshopping.in/ProductListing.asmx/GetProductList", , (err, response, body) => {
      //       	var $ =cheerio.load(body);
      //       	console.log(body);
      //       });

            request({
    			method: 'POST',
    			url : 'http://www.hpshopping.in/ProductListing.asmx/GetProductList',
    			body: {
    				{
    
						"vCurrentPage"
						:
						"1",
						"vFilterValues"
						:
						"Ink_Cartridges",
						"vItemTotal"
							:
							"168",
							"vRefTypeName"
							:
							"Ink_and_Toner",
							"vSearch"
							:
							"",
							"vStoreName"
							:
							"STORE",
							"vTabbedPanel"
							:
							"4"
							}
    			}


     //        $.ajax({
     //            type: "POST",
     //            url: "http://www.hpshopping.in/ProductListing.asmx/GetProductList",
     //            dataType: "json",
     //            contentntType: "application/json; charset=utf-8",
     //            data: JSON.stringify(code),
     //            success: function (r) {

     //     	console.log(r);
     //     }
     // });

			// $('div.nm').find('a').each(function(){
			// 	var nextcategory = $(this).attr('href');
			// 	var LandingUrl = MainUrl.concat(nextcategory);
			// 	//console.log(LandingUrl);
				

			// 	FetchCategoryFeatures(LandingUrl);
			// })
		//})
	});
}

var init = function () {
	co(function*() {
		
		console.log('started!!!')
		FetchUrls();
		
	});
}


console.log("started scraping hp inr and toner!!!")
init();