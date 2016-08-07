'use strict';
var request = require('request');
var cheerio = require('cheerio');
var co = require('co');
var Excel = require('exceljs');
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

// worksheet.columns = [
//     { header: "URL", key: "url", width: 30 },
//     { header: "Title", key: "title", width: 20 }
// ];

// worksheet.addRow({url: null, titles: 'title'}).commit();
// // worksheet.commit();
// workbook.xlsx.writeFile('luxor.xlsx').then(() => {console.log('writtten');});

function FetchCategoryFeatures(urls){
	co(function*(){
		var url1 = urls ;
		let flag = 0 ;
		const promise = new Promise((resolve, reject) => {
			request(url1 , function(err,resp,body){

				// console.log(body);
				var $ = cheerio.load(body);
				
				if ( $('div').hasClass('luxor_product') ){
					flag = 1 ;
					var url =$('meta[property="og:url"]').attr('content');
					var price = $('div.Product_price h2').text();
					if (price == ''){
						price = $('div.sellingprice').text();
					}
					var imageUrls = $('img.cloudzoom#zoom1').attr('src');
					var Actors = $('div.luxorreviews li.brand').text().trim();
					var Directors = $('div.ProductDetailsGrid').children().next().next().first().children('div.Value').text().trim();
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

					var saveObject = {
				      	url : url1, title : title, features : features, imageUrls : imageUrls, price : price, description : description, 
						Actors : Actors, Directors : Directors, Language : Language, Subtitles : Subtitles, Region : Region, 
						numberOfDiscs : numberOfDiscs, Studio : Studio, releaseDate : releaseDate, Format : Format, Rated : Rated, Rated1 : Rated1, runTime : runTime, sheetSize : sheetSize,
						specifications : specifications, path : path, keywords : keywords

				    };	
				    
				    //console.log(saveObject);
				    resolve(saveObject);
				    //console.log(flag);
			    }	else { reject({err: 'Not applicable'});}
			})
		});
		const fetchedObject = yield Promise.resolve(promise);
		// console.log(flag);
		// console.log(fetchedObject);
		//console.log(flag);
		if(flag === 1){
			
			// console.log(fetchedObject);
			console.log('entering');
		    worksheet.addRow(fetchedObject).commit();	
		    try {
		    	// console.log(fetchedObject);
		    	// console.log(workbook.xlsx);
		    	const write = new Promise((resolve, reject) => {
		    		// console.log('Reached in promise');
		    		// console.log(workbook.xlsx.writeFile.toString());
		    		 workbook.xlsx.writeFile("LUXOR.xlsx").then(function() {
				    	console.log("Row added & Saved");
		    		 	resolve('success');
				    }).catch(function(err) {
				    	console.log(err);
				    	reject('fail');
				    });	
		    	});
		    	console.log(write);
		    	const resp = yield Promise.resolve(write);
		    	console.log(resp);
			} catch(err) { console.log('error writing'); console.log(err);}
		}   
	})

}


function FetchUrls(){
	co(function*(){
		 request(BaseUrl,function(err,resp,body){
		 	// console.log(body);
		 	if(body) {		
			 	var $ = cheerio.load(body, {
			    	xmlMode: true
			    });

	   			$('urlset url').find('loc').each(function(){
	   				var LandingUrl = $(this).text() ;
	   				//console.log(LandingUrl);
					FetchCategoryFeatures(LandingUrl);	
				})
		 	}
		})
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