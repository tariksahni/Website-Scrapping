'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var Excel = require('exceljs');
var async = require('async');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('LUXOR PRODUCTS');
var _ = require('lodash');
var BaseUrl = "http://www.luxor.in/sitemap.xml";
var MainUrl = "http://www.luxor.in";

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

var FetchCategoryFeatures = async.queue(function (urls, callback){
	co(function*(){
		var url1 = urls ;
		let flag = 0 ;
		let result = yield request(url1); 
	   	let response = result;
		let body = result.body;

	    var $ = cheerio.load(body, {
		    	xmlMode: true
		    });
		if ( $('div').hasClass('luxor_product') ){
			try {
			flag = 1 ;
			var url =$('meta[property="og:url"]').attr('content');
			var price = $('div.Product_price h2').text();
			if (price === ''){
				price = $('div.sellingprice').text();
			}
			var imageUrls = $('img.cloudzoom#zoom1').attr('src');
			var Actors = $('div.luxorreviews li.brand').text().trim();
			var Directors = $('div.ProductDetailsGrid').children().next().next().first().children('div.Value').text().trim();
			console.log(Directors);
			var title =$('div.BlockContent h1').text().trim();
					
			var path = "";
			$('div#ProductBreadcrumb li').each(function (i, li) {
			    if(!$(li).hasClass('ProductBreadcrumb')) {
					path += $(li).text().trim() + " | ";
				}
			});

			var keywords='' ;
			var description ='';
			if (description.length == 0 ){
				description = $('div.productdesciption_v1 ').find('p').text().trim();
			}
			if (description.length == 0){
				description = $('div.productdesciption_v1 ').find('li').text().trim();
			}
			if (description.length == 0 ){
				description = $('div.productdesciption_v1 ').find( $('div.readmore-js-section') ).text().trim();
			}
					
			var Language='',Region='',Format='',releaseDate='',specifications='',sheetSize='',runTime='',Rated1='',Rated='',Studio='',numberOfDiscs='',Subtitles='',features='' ;
					//console.log(Directors);
			const obj = {url : url1, title : title, features : features, imageUrls : imageUrls, price : price, description : description, 
					Actors : Actors, Directors : Directors, Language : Language, Subtitles : Subtitles, Region : Region, 
					numberOfDiscs : numberOfDiscs, Studio : Studio, releaseDate : releaseDate, Format : Format, Rated : Rated, Rated1 : Rated1, runTime : runTime, sheetSize : sheetSize,
					specifications : specifications, path : path, keywords : keywords };
			console.log(obj);
			worksheet.addRow(obj).commit();;

		    yield workbook.xlsx.writeFile("LUXOR.xlsx").then(function() {
		    	console.log("Row added & Saved");
		    });
		} catch(err) { console.log('adsdasdasd');console.log(err);}
		} 
		var stop = new Date().getTime();
	    while(true) {
	        if(new Date().getTime() > stop + 2500) {
	        	callback();
	        	break;
	        }
	    }
	}).catch(function (err) {
		console.log('catch');
	    console.error(err);
	    callback();
	});
}, 3);





function FetchUrls(){
	co(function*(){
		 request(BaseUrl,function(err,resp,body){
		 	var $ = cheerio.load(body, {
		    	xmlMode: true
		    });
		 	//console.log("haan")
   			$('urlset url').find('loc').each(function(){
   				var LandingUrl = $(this).text() ;
   				//console.log(LandingUrl);
				FetchCategoryFeatures.push(LandingUrl,function(err){
					console.log(err);
				});		
				return false;
			});
		});
	});	 
}

var init = function () {
	co(function*() {
		
		console.log('started!!!')
		FetchUrls();
		
	});
}


console.log("started scraping LUXOR!!!")
init();