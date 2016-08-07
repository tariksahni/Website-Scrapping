'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var async = require('async');
const BaseUrl = "http://www.shopcrocs.in/sitemap.xml";
var pages = 0;
var productPages = 0;
var sleep = require('sleep');
var _ = require('lodash');
var Excel = require('exceljs');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('CROCS(INDIA)');

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
    header: "Price",
    key: "price",
    width: 30
  },
  {
    header: "Images",
    key: "imageUrls",
    width: 30
  },
  {
    header: "Description",
    key: "description",
    width: 30
  },
   {
    header: "Features",
    key: "features",
    width: 30
  },
  {
    header: "Brand",
    key: "brand",
    width: 15
  },
  {
    header: "Model Number",
    key: "model",
    width: 15
  },
  {
    header: "Category",
    key: "category",
    width: 15
  },
  {
    header: "Weight",
    key: "weight",
    width: 15
  },
  {
    header: "Keywords",
    key: "keywords",
    width: 30
  }
];

var checkIfProductPage = async.queue(function(url1, callback) {
  co(function*() {
    let result = yield request(url1);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body);
    if ($('div').hasClass('product-name')) {
      var title = $('div.product-name h1').text().trim();
      var url122 = url1.replace(/(\r\n|\n|\r)/gm,"");
      var price = $('div.price-box span.price').last().text().trim();
      var imageUrls = $('p.product-image-zoom').find('a').first().attr('href');
      var brand = "CROCS"
      var description = $('div.description').find('p').first().text().trim().replace(/(\r\n|\n|\r)/gm,"");;
      var features = $('div.description').find('li').text().trim().replace(/(\r\n|\n|\r)/gm,"");;
      var model = $('div.bottom_media div.item_id').text().trim().split("#")[1];
      var keywords = $('meta[name="keywords"]').attr('content');
      var detailss = [] ;
      var a1 = $('div.product_details').find('td').each(function(i,tdElem){
        detailss[i]  = $(this).text();
      });
      var category , weight ;
      for (var i = 0 ; i<detailss.length ; i ++){
        // console.log(detailss[i]);
        if(detailss[i]=='Category'){
          category = detailss[i+1];
        }
        if(detailss[i]=='Weight'){
          weight = detailss[i+1];
        }
      }
      // console.log(category);
      var saveObject = {
        url122: url122,
        title: title,
        imageUrls: imageUrls,
        price: price,
        brand:brand,
        category:category,
        weight:weight,
        features:features,
        description: description,
        model:model,
        keywords: keywords
      };
      // console.log(saveObject);
      worksheet.addRow(saveObject).commit();;
      yield workbook.xlsx.writeFile('CrocsIndia.xlsx').then(function() {
        console.log('Row added & Saved');
      });
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
    let result = yield request(BaseUrl);
    let response = result;
    let body = result.body;
    try {
      if (body) {
        var $ = cheerio.load(body, {
          xmlMode: true
        });
        $('urlset url').find('loc').each(function() {
          var landingUrl = $(this).text();
          // landingUrl = "http://www.shopcrocs.in/crocs-handle-it-rain-boot-kids-pink-boot.html";
          co(function*() {
            checkIfProductPage.push(landingUrl, function(err) {
              pages++;
              console.log('Page - ' + pages + ' finished processing - Pages Left - ' +
                checkIfProductPage.length() + '\n');
            });
          }).then(function(value) {
          }).catch(function(err) {
            console.log(err)
          });
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

console.log('Starting CROCS(INDIA)Crawling....');
init();