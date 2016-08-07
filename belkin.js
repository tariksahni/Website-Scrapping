'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var Excel = require('exceljs');
var async = require('async');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('DATA');
var _ = require('lodash');
var page_no = 0;
var link = 0;
var link1 = 0;
var pages_processed = 0;
var sleep = require('sleep');
const BaseUrls = ["http://www.belkin.com/in/Products/MacBook-&-PC/Cables-and-Other-Accessories/Other-Accessories/c/WSMACPCOAMC/","http://www.belkin.com/in/Products/MacBook-&-PC/Cables-and-Other-Accessories/Cables/c/WSMACPCCBLSOCC/","http://www.belkin.com/in/Products/MacBook-&-PC/Cables-and-Other-Accessories/Cables/c/WSMACPCCBLSNC/","http://www.belkin.com/in/Products/MacBook-&-PC/Cables-and-Other-Accessories/Cables/c/WSMACPCCBLSMACHDTV/","http://www.belkin.com/in/Products/MacBook-&-PC/Cables-and-Other-Accessories/Cables/c/WSMACPCCBLSAC/","http://www.belkin.com/in/Products/MacBook-&-PC/Cables-and-Other-Accessories/Cables/c/WSMACPCCBLSVC/","http://www.belkin.com/in/Products/MacBook-&-PC/Cables-and-Other-Accessories/Cables/c/WSMACPCCBLSDC/","http://www.belkin.com/in/Products/MacBook-&-PC/Cables-and-Other-Accessories/Cables/c/WSMACPCCBLSUSBC/","http://www.belkin.com/in/Products/MacBook-&-PC/Cables-and-Other-Accessories/Other-Accessories/c/WSMACPCOAOTH/","http://www.belkin.com/in/Products/MacBook-&-PC/c/WSMACPCCAC/","http://www.belkin.com/in/Products/MacBook-&-PC/Hubs-&-Docks/c/WSMACPCHUBSTB/","http://www.belkin.com/in/Products/MacBook-&-PC/Hubs-&-Docks/c/WSMACPCHUBSTH/","http://www.belkin.com/in/Products/MacBook-&-PC/Hubs-&-Docks/c/WSMACPCHUBS4PPH/","http://www.belkin.com/in/Products/MacBook-&-PC/Hubs-&-Docks/c/WSMACPCHUBS7PPH/","http://www.belkin.com/in/Products/MacBook-&-PC/Laptop-Covers-&-Bags/c/WSMACPCCABCS/","http://www.belkin.com/in/Products/MacBook-&-PC/Laptop-Covers-&-Bags/c/WSMACPCCABBG/","http://www.belkin.com/in/Products/MacBook-&-PC/Laptop-Covers-&-Bags/c/WSMACPCCABCV/","http://www.belkin.com/in/Products/MacBook-&-PC/Laptop-Covers-&-Bags/c/WSMACPCCABSL/","http://www.belkin.com/in/Products/Business/Smartphone-Accessories/c/ENTSAHUBS/","http://www.belkin.com/in/Products/Business/Smartphone-Accessories/c/ENTSAPC/","http://www.belkin.com/in/Products/Business/Smartphone-Accessories/c/ENTSAUSBC/","http://www.belkin.com/in/Products/Business/Fiber-Optics-Cables/c/ENTFOCMFOC/","http://www.belkin.com/in/Products/Business/Bulk-Copper-Cables/c/ENTBCCCAT6A/","http://www.belkin.com/in/Products/Business/Bulk-Copper-Cables/c/ENTBCCCAT6/","http://www.belkin.com/in/Products/Business/Copper-Patch-Cables/c/ENTCPCCAT6/","http://www.belkin.com/in/Products/Business/Copper-Patch-Cables/c/ENTCPCCAT5E/","http://www.belkin.com/in/Products/Business/Copper-Patch-Cables/c/ENTCPCCAT6A/","http://www.belkin.com/in/Products/Business/Tablet-Accessories/c/ENTTAUSBC/","http://www.belkin.com/in/Products/Business/Tablet-Accessories/c/ENTTAPC/","http://www.belkin.com/in/Products/Business/Tablet-Accessories/c/ENTTAAVC/","http://www.belkin.com/in/Products/Cases-and-Armbands/c/iPod-Cases/","http://www.belkin.com/in/Products/Cases-and-Armbands/c/Active-and-Armband-Cases/","http://www.belkin.com/in/Products/Cases-and-Armbands/c/WSCAPSPC/","http://www.belkin.com/in/Products/In-Car/c/WSICHF/","http://www.belkin.com/in/Products/Mobile-Accessories/Chargers-&-Cables/c/WSSTCBLS/","http://www.belkin.com/in/Products/Mobile-Accessories/Chargers-&-Cables/Chargers/c/WSSTCRGCC/","http://www.belkin.com/in/Products/Mobile-Accessories/Chargers-&-Cables/Chargers/c/WSSTCRGWC/","http://www.belkin.com/in/Products/Mobile-Accessories/c/screen-protection/","http://www.belkin.com/in/Products/In-Car/c/WSICCM/","http://www.belkin.com/in/Products/Mobile-Accessories/c/docks-and-stands/","http://www.belkin.com/in/Products/Mobile-Accessories/c/WSSTOTHA/","http://www.belkin.com/in/Products/Entertainment/Audio/Bluetooth/c/WSENTHAABTCR/","http://www.belkin.com/in/Products/Entertainment/Audio/Bluetooth/c/WSENTHAABTMR/","http://www.belkin.com/in/Products/Entertainment/Home-Theater/Home-Theater-Accessories/c/WSENTMTVAHTSP/","http://www.belkin.com/in/Products/Entertainment/Home-Theater/Home-Theater-Accessories/c/WSENTMTVAHTAVC/","http://www.belkin.com/in/Products/Entertainment/Home-Theater/Home-Theater-Accessories/c/WSENTMTVAHTHDMICBL/","http://www.belkin.com/in/Products/Entertainment/Home-Theater/Home-Theater-Accessories/c/WSENTMTVAHTLTVC/","http://www.belkin.com/in/Products/Entertainment/Audio/c/WSENTHAAAC/","http://www.belkin.com/in/Products/Entertainment/Audio/c/WSENTHAAHPS/","http://www.belkin.com/in/Products/Networking/c/WSNTWRD/","http://www.belkin.com/in/Products/Networking/Routers-&-Adapters/c/WSNTWLSRE/","http://www.belkin.com/in/Products/Networking/Routers-&-Adapters/c/WSNTWLSRTR/","http://www.belkin.com/in/Products/Networking/Routers-&-Adapters/c/WSNTWLSUSBA/","http://www.belkin.com/in/Products/Networking/Routers-&-Adapters/c/WSNTWLSMRTR/","http://www.belkin.com/in/Products/Networking/Routers-&-Adapters/c/WSNTWLSOTH/","http://www.belkin.com/in/Products/Cables/c/usb-c-cables/","http://www.belkin.com/in/Products/Cables/audio-video-cables/c/WSCBLSAVVCA/","http://www.belkin.com/in/Products/Cables/audio-video-cables/c/WSCBLSAVACA/","http://www.belkin.com/in/Products/Cables/audio-video-cables/c/WSCBLSAVHDMICA/","http://www.belkin.com/in/Products/Cables/c/smartphone-and-tablet-cables/","http://www.belkin.com/in/Products/Power/c/WSPWRCSR/","http://www.belkin.com/in/Products/Power/Charging/c/portable-chargers-and-battery-packs/","http://www.belkin.com/in/Products/Power/Surge-Protection/c/WSPWRSPTS/","http://www.belkin.com/in/Products/Power/Surge-Protection/c/WSPWRSPHO/","http://www.belkin.com/in/Products/Power/Surge-Protection/c/WSPWRSPBS/","http://www.belkin.com/in/Products/Power/Surge-Protection/c/WSPWRSPHT/","http://www.belkin.com/in/Products/Lightning/c/WSLTIC/","http://www.belkin.com/in/Products/Lightning/c/WSLTCRG/","http://www.belkin.com/in/Products/Lightning/c/WSLTCBLS/","http://www.belkin.com/in/Products/Lightning/c/WSLTDAS/","http://www.belkin.com/in/Products/Lightning/c/WSLTDAS/","http://www.belkin.com/in/Products/Collections/c/Lego-Cases-for-iPad-iPhone-and-iPod/","http://www.belkin.com/in/Products/Collections/c/Mix-It-Up/","http://www.belkin.com/in/Products/Collections/c/Orla-Kiely/","http://www.belkin.com/in/Products/In-Car/c/WSICHF/","http://www.belkin.com/in/Products/In-Car/c/WSICCM/",""];
const MainUrl = "http://www.belkin.com";
worksheet.columns = [
  {
    header: "URL",
    key: "url",
    width: 30
  },
  {
    header: "Title",
    key: "title",
    width: 20
  },
  {
    header: "Images",
    key: "imageUrls",
    width: 30
  },
  {
    header: "Colors",
    key: "colors",
    width: 30
  },
  {
    header: "SKU",
    key: "sku",
    width: 30
  },
  {
    header: "Overview",
    key: "overview",
    width: 30
  },
  {
    header: "Features",
    key: "features",
    width: 30
  },
  {
    header: "Compatibility",
    key: "comp",
    width: 30
  },
  {
    header: "Specifications",
    key: "specifications",
    width: 30
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

var fetchProductInfo = async.queue(function(url1, callback) {
  co(function*(){
    let result = yield request(url1);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body, {
      xmlMode: true
    });
    var title = $('div.product-name-price h1').text().trim();
    var url = url1.replace(/(\r\n|\n|\r)/gm, "");
    var imageUrls;
    $('ul#image-gallery li').find('img').each(function(i ,image){
      if(i==0){
        var imageUrls_temp = $(this).attr('src');
        imageUrls = MainUrl.concat(imageUrls_temp);
      }  
      else {
        imageUrls += ";" ; var imageUrls_temp1 = $(this).attr('src'); imageUrls += MainUrl.concat(imageUrls_temp1);
      }
    });
    var sku = $('p.product-part-number').text().trim();
    var path = "Home | ";
    $('ol#main_breadcrumb li').each(function(j,li){
      $(li).find('a.current-sub-menu').each(function(k,a){
        path += $(a).text();
        path += " | ";
      });
    });
    var colors = "" ;
    $('ul.color-options span').each(function(){
      colors += $(this).text();
      colors += ';' ;
    });
    var overview ;
    var features ;
    var specifications ;
    $('section.content-tab-info-container').each(function(i,section){
      if(i == 0){
        overview = $(section).text().replace(/(\r\n|\n|\t|\r)/gm, "");
        overview = overview.replace('Overview',"");
      }
      if(i == 1){
        features = $(section).text().replace(/(\r\n|\n|\t|\r)/gm, "");
        features = features.replace('Features',"");
      }
      if(i == 2){
        specifications = $(section).text().replace(/(\r\n|\n|\t|\r)/gm, "");
        specifications = specifications.replace('Specifications',"");
      }
    });
    var comp = "";
    $('div.product-compatibility li').each(function(){
      comp += $(this).text().replace(/(\r\n|\n|\t|\r)/gm, "");
      comp += ';' ;
    });
    var keywords = "NA";
    var saveObject = {
      url: url,
      title: title,
      imageUrls: imageUrls,
      sku:sku,
      colors:colors,
      overview:overview,
      specifications:specifications,
      features:features,
      path: path,
      comp:comp,
      keywords:keywords 
    };
    // console.log(saveObject);
    worksheet.addRow(saveObject).commit();
    yield workbook.xlsx.writeFile("belkin.xlsx").then(function() {
      console.log("Row added & Saved");
    });
    var stop = new Date().getTime();
    while (true) {
      if (new Date().getTime() > stop + 2000) {
        callback();
        break;
      }
    }
  }).catch(function(err) {
    console.error(err);
    callback();
  });
}, 1);

var fetchProductUrls = async.queue(function(url, callback) {
  co(function*() {
    let result = yield request(url);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body, {
      xmlMode: true
    });
    $('div.product-group ul.items').each(function(i, li) {
      $(li).find('li a').each(function(j, l) {
        var url22 = $(l).attr('href');
        var url221 = MainUrl.concat(url22);
        fetchProductInfo.push(url221, function(err) {
          link1++;
          console.log('Product - ' + link1 + ' finished processing - Links Left - ' + fetchProductInfo.length() + "\n");
        });
      });
    });
    var stop = new Date().getTime();
    while (true) {
      if (new Date().getTime() > stop + 1500) {
        callback();
        break;
      }
    }
  }).catch(function(err) {
    console.error(err);
    callback();
  });
}, 1);

fetchProductInfo.drain = function() {
  console.log('All products processed'.blue);
  process.exit(1);
};

var init = function() {
  for(var i =0 ; i < BaseUrls.length ; i++){
    co(function*() {
      fetchProductUrls.push(BaseUrls[i], function(err) {
        link++;
        console.log('Link - ' + link + ' finished processing - Links Left - ' + fetchProductUrls.length());
      });
    }).then(function(value) {});
  }
  
  console.log("After fetch urls");
};

console.log("started scraping !!!")
init();