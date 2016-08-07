'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var async = require('async');
// var url = 'http://taylormadegolf.com/sitemap1_default.xml';

var baseUrl = 'http://www.luxor.in/sitemap.xml';
// 'http://www.luxor.in/parker-beta-premium-gold-roller-ball-pen_9000017276.html';
//
const BaseUrl = "http://www.luxor.in/sitemap.xml";
const MainUrl = "http://www.luxor.in";
var pages = 0;
var productPages = 0;
var sleep = require('sleep');
var _ = require('lodash');
var Excel = require('exceljs');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('LUXOR');

worksheet.columns = [
  {
    header: "URL",
    key: "url122",
    width: 30
  },
  {
    header: "Title",
    key: "title",
    width: 20
  },
{
  header: "Features",
  key: "features",
  width: 30
},
{
  header: "Images",
  key: "imageUrls",
  width: 30
},
{
  header: "MRP",
  key: "price",
  width: 15
},
{
  header: "Description",
  key: "description",
  width: 30
},
{
  header: "Brand",
  key: "Actors",
  width: 15
},
{
  header: "Model Number",
  key: "Directors",
  width: 15
},
{
  header: "Ink Colour",
  key: "Rated",
  width: 15
},
{
  header: "Path",
  key: "path",
  width: 30
},
{
  header: "Keywords",
  key: "keywords",
  width: 30
}
];

var checkIfProductPage = async.queue(function(url1, callback) {
  co(function*() {
    // var url1 = obj.pageUrl;
    // var name = obj.name;

    let result = yield request(url1);
    let response = result;
    let body = result.body;
    // console.log(body);
    var $ = cheerio.load(body);
    let flag = 0;
    if ($('div').hasClass('luxor_product')) {
      flag = 1 ;
      
      var url122 = url1.replace(/(\r\n|\n|\r)/gm,"");
      var price = $('div.Product_price h2').text();
      if (price === '') {
        price = $('div.sellingprice').text();
      }
      var imageUrls;
      imageUrls =$('img.cloudzoom#zoom1').attr('src');
      if(!imageUrls){ 
        imageUrls = $('a.jqzoom').attr('href');
      }

      
      
      var Actors = $('div.luxorreviews li.brand').text().trim();
      var Directors = $('div.ProductDetailsGrid').children().next().next().first().children('div.Value').text().trim();
      var title = $('div.BlockContent h1').text().trim();

      var path = "";
      $('div#ProductBreadcrumb li').each(function(i, li) {
        if (!$(li).hasClass('ProductBreadcrumb')) {
          path += $(li).text().trim() + " | ";
        }
      });

      var keywords = 'NA';
      var description = '';
      
          description += $('div.productdesciption_v1').children('div.viewmoreclass').text().trim();
          description += $('div.productdesciption_v1 ').find('p').text().trim();
          description += $('div.productdesciption_v1 ').find('li').text().trim();
      
      var Language = 'NA',
        Region = 'NA',
        Format = 'NA',
        releaseDate = 'NA',
        specifications = 'NA',
        sheetSize = 'NA',
        runTime = 'NA',
        Rated1 = 'NA',
        Studio = 'NA',
        numberOfDiscs = 'NA',
        Subtitles = 'NA',
        features = 'NA';
        //console.log(Directors);
      var Rated ;
      var detailss =[];
      $('div.ProductDetailsGrid').find('div.DetailRow div').each(function(i,jj){
        detailss[i]=$(this).text().trim();

      });
      for(var i =0; i<detailss.length ; i++){
        if(detailss[i]=='Ink Color:')Rated=detailss[i+1];
      }
      console.log(Rated);
      var saveObject = {
        url122: url122,
        title: title,
        imageUrls: imageUrls,
        price: price,
        description: description,
        Actors: Actors,
        Rated:Rated,
        Directors: Directors,
        specifications: specifications,
        path: path,
        keywords: keywords
      };
      // }
      // if ($('div').hasClass('body-c1')) {
      // console.log(saveObject);
      worksheet.addRow(saveObject).commit();;

      yield workbook.xlsx.writeFile('Luxor(22).xlsx').then(function() {
        console.log('Row added & Saved');
      });
      // console.log(description);

      //Wait for some time before next call
      var stop = new Date().getTime();
      while (true) {
        if (new Date().getTime() > stop + 2000) {
          callback();
          break;
        }
      }
    } else {
      console.log(url1 + ' - Not Product');
      callback();
    }

  }).catch(function(err) {
    console.error(err);
    callback();
  });
}, 1);


function fetchSiteUrls() {
  co(function*() {
    console.log('Inside fetchSiteUrls');
    let result = yield request(baseUrl);
    let response = result;
    let body = result.body;

    try {
      if (body) {
        var $ = cheerio.load(body, {
          xmlMode: true
        });

        $('urlset url').find('loc').each(function() {
          var landingUrl = $(this).text();
          // console.log(landingUrl);
          // landingUrl=  "http://www.luxor.in/pilot-v5-pen-%28-1-blue--%252b-1-black--%252b-1-green%29_9000014713.html";
          co(function*() {
            checkIfProductPage.push(landingUrl, function(err) {
              pages++;
              console.log('Page - ' + pages + ' finished processing - Pages Left - ' +
                checkIfProductPage.length() + '\n');
            });
          }).then(function(value) {
            // console.log(value);
          }).catch(function(err) {
            console.log(err)
          });
        // FetchCategoryFeatures(landingUrl);
        });
      }
    } catch (err) {
      console.log(err);
    }
  }).then(function(value) {
    console.log(value);
  }).catch(function(err) {
    console.error(err.stack);
  });
}

checkIfProductPage.drain = function() {
  console.log('All pages processed');
  process.exit(1);
};

var init = function() {
  fetchSiteUrls();
  console.log('After fetch urls');
};

console.log('Starting Luxor Crawling....');
init();