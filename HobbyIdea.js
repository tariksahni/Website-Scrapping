'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var async = require('async');
const BaseUrl = "http://www.shop.hobbyideas.in/sitemap.xml";
var pages = 0;
var productPages = 0;
var sleep = require('sleep');
var _ = require('lodash');
var Excel = require('exceljs');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('HobbyIdeas');

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
    header: "Product Target Age",
    key: "pta",
    width: 30
  },
  {
    header: "Brand",
    key: "brand",
    width: 15
  },
  {
    header: "SKU",
    key: "sku",
    width: 15
  },
  {
    header: "Contents",
    key: "content",
    width: 15
  },
  {
    header: "Product Dimensions",
    key: "proddim",
    width: 15
  },
  {
    header: "Path",
    key: "path",
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
    if ($('div').hasClass('ctl_aboutbrand')) {
      var title = $('div.ctl_aboutbrand h1').text().trim();
      var url122 = url1.replace(/(\r\n|\n|\r)/gm,"");
      var price = $('span.sp_amt').text().trim();
      var imageUrls = $('div.productlagreimg img#bankImage').attr('src');
      imageUrls = imageUrls.split(';')[0];
      var sku = imageUrls.split('/')[9].split('.')[0].split('_')[0];
      var brand = $('span.brandlname').text().trim();
      var description = $('div#Description').text().trim();
      if(!description){
        $('div#Description').find('li').each(function(){
          if(i == 0)description = $(this).text().trim().replace(/(\r\n|\n|\r)/gm,"");
          else description += $(this).text().trim().replace(/(\r\n|\n|\r)/gm,"");
        })
      }
      description= description.replace(/(\r\n|\n|\r)/gm,"");
      var keywords = $('meta[name="keywords"]').attr('content');
      var path = "HOME|SHOP NOW |"
      $('div.breadcrumlnk').find('span[itemprop="title"]').each(function(i,span1){
        if(i==1)path += '|' ;
        path += $(this).text().trim();
      });
      var detailss = [] ;
      var a2 = $('tbody').find('td label').each(function(i,tdElem){
        detailss[i]  = $(this).text();
      });
      var proddim , weight , content , pta ;
      for (var i = 0 ; i<detailss.length ; i ++){
        if(detailss[i]=='Product Dimension'){
          proddim = detailss[i+1];
        }
        if(detailss[i]=='weight'){
          weight = detailss[i+1];
          if(weight)weight = weight.split('.')[1];
        }
        if(detailss[i]=='Weight'){
          weight = detailss[i+1];
          if(weight)weight = weight.split('.')[1];
        }
        if(detailss[i]=='Contents'){
          content = detailss[i+1];
        }
        if(detailss[i]=='Target Age Group'){
          pta = detailss[i+1];
        }
        if(detailss[i]=="Product's Target Age"){
          pta = detailss[i+1];
        }
      }
      var saveObject = {
        url122: url122,
        title: title,
        imageUrls: imageUrls,
        price: price,
        brand:brand,
        weight:weight,
        description: description,
        path:path,
        pta:pta,
        sku:sku,
        proddim:proddim,
        content:content,
        keywords: keywords
      };
      // console.log(saveObject);
      worksheet.addRow(saveObject).commit();;
      yield workbook.xlsx.writeFile('hobbyideas.xlsx').then(function() {
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
          // landingUrl = "http://www.shop.hobbyideas.in/products/books-drawing-books--sketch-pads/navneet/my-yellow-drawing-book--small-size-36-pages/pid-9886010.aspx";
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

console.log('Starting HobbyIdea Crawling....');
init();