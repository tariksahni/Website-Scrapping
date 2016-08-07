'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var Excel = require('exceljs');
var async = require('async');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('ASICS');
var _ = require('lodash');
var page_no = 0;
var link = 0;
var link1 = 0;
var pages_processed = 0;
var sleep = require('sleep');
var BaseUrl = ["http://www.melissaanddoug.com/New-Arrivals?&n=0&va=t","http://www.melissaanddoug.com/Shop-By-Category-Active-Play-and-Outdoor-Balls","http://www.melissaanddoug.com/Shop-By-Category-Active-Play-and-Outdoor-Bubbles","http://www.melissaanddoug.com/Shop-By-Category-Active-Play-and-Outdoor-Chairs-and-Tunnels","http://www.melissaanddoug.com/Shop-By-Category-Active-Play-and-Outdoor-Games","http://www.melissaanddoug.com/Shop-By-Category-Active-Play-and-Outdoor-Kids-Accessories","http://www.melissaanddoug.com/Shop-By-Category-Active-Play-and-Outdoor-Lawn-and-Garden","http://www.melissaanddoug.com/Shop-By-Category-Active-Play-and-Outdoor-Pool-Toys","http://www.melissaanddoug.com/Shop-By-Category-Active-Play-and-Outdoor-Sand-Toys","http://www.melissaanddoug.com/Shop-By-Category-Active-Play-and-Outdoor-Science-and-Nature","http://www.melissaanddoug.com/product_list/1018276.1129983.1143290.0.0/Sunny_Patch?&n=0&va=t","http://www.melissaanddoug.com/Shop-By-Category-Active-Play-and-Outdoor-Tents-and-Sleeping-Bags","http://www.melissaanddoug.com/Shop-By-Category-Activity-Pads-Coloring-Books-and-Pads","http://www.melissaanddoug.com/Shop-By-Category-Activity-Pads-Drawing-Pads","http://www.melissaanddoug.com/Shop-By-Category-Activity-Pads-Early-Learning-Skill-Builders","http://www.melissaanddoug.com/Shop-By-Category-Activity-Pads-Sticker-Pads","http://www.melissaanddoug.com/Shop-By-Category-Activity-Pads-Spy-Secrets-and-Mysteries","http://www.melissaanddoug.com/Shop-By-Category-Activity-Pads-Water-Coloring-and-Painting","http://www.melissaanddoug.com/Shop-By-Category-Arts-and-Crafts-Tattoos","http://www.melissaanddoug.com/Shop-By-Category-Arts-and-Crafts-Basic-Supplies","http://www.melissaanddoug.com/Shop-By-Category-Arts-and-Crafts-Beading","http://www.melissaanddoug.com/Shop-By-Category-Arts-and-Crafts-Clay","http://www.melissaanddoug.com/Shop-By-Category-Arts-and-Crafts-Coloring","http://www.melissaanddoug.com/Shop-By-Category-Arts-and-Crafts-Craft-Kits","http://www.melissaanddoug.com/Shop-By-Category-Arts-and-Crafts-Drawing","http://www.melissaanddoug.com/Shop-By-Category-Arts-and-Crafts-Easels-and-Accessories","http://www.melissaanddoug.com/Shop-By-Category-Arts-and-Crafts-Embroidering-Weaving-and-Looming","http://www.melissaanddoug.com/Shop-By-Category-Arts-and-Crafts-Fashion-Design","http://www.melissaanddoug.com/Shop-By-Category-Arts-and-Crafts-Jewelry","http://www.melissaanddoug.com/Shop-By-Category-Arts-and-Crafts-Painting","http://www.melissaanddoug.com/Shop-By-Category-Arts-and-Crafts-Paper-Crafts","http://www.melissaanddoug.com/Shop-By-Category-Arts-and-Crafts-Stamp-Pads-and-Sets","http://www.melissaanddoug.com/Shop-By-Category-Arts-and-Crafts-Stickers","http://www.melissaanddoug.com/Shop-By-Category-Baby-and-Toddler-Activity-Centers","http://www.melissaanddoug.com/Shop-By-Category-Baby-and-Toddler-Bath-Toys","http://www.melissaanddoug.com/Shop-By-Category-Baby-and-Toddler-Books","http://www.melissaanddoug.com/Shop-By-Category-Baby-and-Toddler-Developmental-Toys","http://www.melissaanddoug.com/Shop-By-Category-Baby-and-Toddler-Ks-Kids","http://www.melissaanddoug.com/Shop-By-Category-Baby-and-Toddler-Push-and-Pull-Toys","http://www.melissaanddoug.com/Shop-By-Category-Baby-and-Toddler-Rocking-and-Ride-On-Toys","http://www.melissaanddoug.com/Shop-By-Category-Baby-and-Toddler-Sound-and-Movement","http://www.melissaanddoug.com/Shop-By-Category-Baby-and-Toddler-Sound-and-Movement","http://www.melissaanddoug.com/Shop-By-Category-Baby-and-Toddler-Stuffed-Animals","http://www.melissaanddoug.com/Shop-By-Category-Baby-and-Toddler-Wooden-Toys","http://www.melissaanddoug.com/Shop-By-Category-Developmental-Toys-ABCs-and-Spelling","http://www.melissaanddoug.com/Shop-By-Category-Developmental-Toys-Blocks-and-Building-Sets","http://www.melissaanddoug.com/Shop-By-Category-Developmental-Toys-Learning-Mats","http://www.melissaanddoug.com/Shop-By-Category-Developmental-Toys-Magnet-Activities","http://www.melissaanddoug.com/Shop-By-Category-Developmental-Toys-Motor-Skills","http://www.melissaanddoug.com/Shop-By-Category-Developmental-Toys-Numbers-and-Counting","http://www.melissaanddoug.com/Shop-By-Category-Developmental-Toys-Patterns-and-Colors","http://www.melissaanddoug.com/Shop-By-Category-Developmental-Toys-Stacking-and-Sorting","http://www.melissaanddoug.com/Shop-By-Category-Dolls-and-Doll-Houses-Doll-Furniture","http://www.melissaanddoug.com/Shop-By-Category-Dolls-and-Doll-Houses-Doll-Houses","http://www.melissaanddoug.com/Shop-By-Category-Dolls-and-Doll-Houses-Doll-House-Accessories","http://www.melissaanddoug.com/Shop-By-Category-Dolls-and-Doll-Houses-Doll-House-Furniture","http://www.melissaanddoug.com/Shop-By-Category-Dolls-and-Doll-Houses-Doll-Accessories","http://www.melissaanddoug.com/Shop-By-Category-Dolls-and-Doll-Houses-Dolls","http://www.melissaanddoug.com/Shop-By-Category-Games-and-Card-Sets-Card-Games","http://www.melissaanddoug.com/Shop-By-Category-Games-and-Card-Sets-Classic-Games","http://www.melissaanddoug.com/Shop-By-Category-Games-and-Card-Sets-Family-Games","http://www.melissaanddoug.com/Shop-By-Category-Games-and-Card-Sets-Preschool-Games","http://www.melissaanddoug.com/Shop-By-Category-Games-and-Card-Sets-Travel-Games","http://www.melissaanddoug.com/Shop-By-Category-Games-and-Card-Sets-Trivia-Games","http://www.melissaanddoug.com/Shop-By-Category-Magic-Tricks-and-Sets-Sets","http://www.melissaanddoug.com/Shop-By-Category-Musical-Instruments-Instruments","http://www.melissaanddoug.com/Shop-By-Category-Musical-Instruments-Pianos","http://www.melissaanddoug.com/Shop-By-Category-Musical-Instruments-Sets","http://www.melissaanddoug.com/Shop-By-Category-Playspaces-and-Room-Decor-Activity-Rugs","http://www.melissaanddoug.com/Shop-By-Category-Playspaces-and-Room-Decor-Decor","http://www.melissaanddoug.com/Shop-By-Category-Playspaces-and-Room-Decor-Furniture","http://www.melissaanddoug.com/Shop-By-Category-Playspaces-and-Room-Decor-Role-Play-Centers","http://www.melissaanddoug.com/Shop-By-Category-Playspaces-and-Room-Decor-Storage-and-Organization","http://www.melissaanddoug.com/Shop-By-Category-Pretend-Play-Animal-and-People-Playsets","http://www.melissaanddoug.com/Shop-By-Category-Pretend-Play-Appliances","http://www.melissaanddoug.com/Shop-By-Category-Pretend-Play-Cleaning-and-Laundry","http://www.melissaanddoug.com/Shop-By-Category-Pretend-Play-Dishes-Utensils-Pots-and-Pans","http://www.melissaanddoug.com/Shop-By-Category-Pretend-Play-Magnetic-Dress-Up-Sets","http://www.melissaanddoug.com/Shop-By-Category-Pretend-Play-Play-Food","http://www.melissaanddoug.com/Shop-By-Category-Pretend-Play-Playsets-and-Kitchens","http://www.melissaanddoug.com/Shop-By-Category-Pretend-Play-Role-Play","http://www.melissaanddoug.com/Shop-By-Category-Pretend-Play-Tea-and-Coffee-Sets","http://www.melissaanddoug.com/Shop-By-Category-Pretend-Play-Tools-and-Workbenches","http://www.melissaanddoug.com/Shop-By-Category-Puppets-and-Puppet-Theatres-Puppets","http://www.melissaanddoug.com/Shop-By-Category-Puppets-and-Puppet-Theatres-Puppet-Sets","http://www.melissaanddoug.com/Shop-By-Category-Puppets-and-Puppet-Theatres-Theatres","http://www.melissaanddoug.com/Shop-By-Category-Puzzles-3D-Puzzles","http://www.melissaanddoug.com/Shop-By-Category-Puzzles-Floor-Puzzles","http://www.melissaanddoug.com/Shop-By-Category-Puzzles-Jigsaw-Puzzles","http://www.melissaanddoug.com/Shop-By-Category-Puzzles-Learning","http://www.melissaanddoug.com/Shop-By-Category-Puzzles-Sets","http://www.melissaanddoug.com/Shop-By-Category-Puzzles-Storage-and-Organization","http://www.melissaanddoug.com/Shop-By-Category-Puzzles-Toddler-and-Preschool?&n=0&va=t","http://www.melissaanddoug.com/Shop-By-Category-Seasonal-and-Religious-Products-Activity-Books","http://www.melissaanddoug.com/Shop-By-Category-Seasonal-and-Religious-Products-Arts-and-Crafts","http://www.melissaanddoug.com/Shop-By-Category-Seasonal-and-Religious-Products-Blocks","http://www.melissaanddoug.com/Shop-By-Category-Seasonal-and-Religious-Products-Calendar","http://www.melissaanddoug.com/Shop-By-Category-Seasonal-and-Religious-Products-Playsets","http://www.melissaanddoug.com/Shop-By-Category-Seasonal-and-Religious-Products-Prayer-Pals","http://www.melissaanddoug.com/Shop-By-Category-Seasonal-and-Religious-Products-Puzzles","http://www.melissaanddoug.com/Shop-By-Category-Seasonal-and-Religious-Products-Stuffed-Animals-and-Plush","http://www.melissaanddoug.com/Shop-By-Category-Seasonal-and-Religious-Products-Toddler-and-Preschool","http://www.melissaanddoug.com/Shop-By-Category-Stuffed-Animals-and-Plush-Bunnies-Rabbits-and-Ducks","http://www.melissaanddoug.com/Shop-By-Category-Stuffed-Animals-and-Plush-Dogs-and-Cats","http://www.melissaanddoug.com/Shop-By-Category-Stuffed-Animals-and-Plush-Fantasy-Creatures","http://www.melissaanddoug.com/Shop-By-Category-Stuffed-Animals-and-Plush-Farm-Animals","http://www.melissaanddoug.com/Shop-By-Category-Stuffed-Animals-and-Plush-Jumbo","http://www.melissaanddoug.com/Shop-By-Category-Stuffed-Animals-and-Plush-Lifelike","http://www.melissaanddoug.com/Shop-By-Category-Stuffed-Animals-and-Plush-Patterned","http://www.melissaanddoug.com/Shop-By-Category-Stuffed-Animals-and-Plush-Sealife","http://www.melissaanddoug.com/Shop-By-Category-Stuffed-Animals-and-Plush-Special-Occasion","http://www.melissaanddoug.com/Shop-By-Category-Stuffed-Animals-and-Plush-Teddy-Bears","http://www.melissaanddoug.com/Shop-By-Category-Stuffed-Animals-and-Plush-Wildlife","http://www.melissaanddoug.com/Shop-By-Category-Vehicles-Trains-and-Railway-Sets","http://www.melissaanddoug.com/Shop-By-Category-Vehicles-Activity-Rugs","http://www.melissaanddoug.com/Shop-By-Category-Vehicles-Cars-and-Trucks","http://www.melissaanddoug.com/Shop-By-Category-Vehicles-Emergency-Vehicles","http://www.melissaanddoug.com/Shop-By-Category-Vehicles-Parking-Garages","http://www.melissaanddoug.com/Shop-By-Category-Vehicles-Planes-and-Buses","http://www.melissaanddoug.com/Shop-By-Category-Vehicles-Sets"];
const MainUrl = "http://www.melissaanddoug.com";
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
    header: "Price",
    key: "price",
    width: 30
  },
  {
    header: "Age Group",
    key: "age",
    width: 15
  },
  {
    header: "Item Number",
    key: "item",
    width: 15
  },
  {
    header: "Brand",
    key: "brand",
    width: 15
  },
  {
    header: "Description",
    key: "description",
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

var fetchProductInfo = async.queue(function(url1, callback) {
  co(function*(){
    let result = yield request(url1);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body, {
      xmlMode: true
    });
    var title = $('h1').text().trim();
    var url = url1.replace(/(\r\n|\n|\r)/gm, "");
    var price = $('span#product_price').text().trim();
    var imageUrls = $('div.main_image').find('a').first().attr('href').split('?')[0];
    var brand = "Mellisa and Doug";
    var item = $('p.item_number').text().trim().split(':')[1];
    var age = $('p.recommended_ages').text().trim();
    var description = $('form[name="prodform"]').next().next().html();
    var keywords = $('meta[name="keywords"]').attr('CONTENT');
    var path = "Home|"
    $('p.breadcrumbs').find('a').each(function(){
      path += $(this).text().trim();
      path += "|";
    })
    path += title;
    var saveObject = {
      url: url,
      title: title,
      imageUrls: imageUrls,
      price:price,
      brand:brand,
      age:age,
      item:item,
      description:description,
      path: path,
      keywords:keywords 
    };
    // console.log(saveObject);
    worksheet.addRow(saveObject).commit();
    yield workbook.xlsx.writeFile("mellisaanddoug.xlsx").then(function() {
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
    $('table.product_list ').find('tr').each(function(i, li) {
      if(i == 0 || (i % 4 ) == 0 ){
        $(li).find('td').each(function(j, l) {
          var url221 = $(l).find('a').first().attr('href');
          var url22 = MainUrl.concat(url221);
          fetchProductInfo.push(url22, function(err) {
            link1++;
            console.log('Product - ' + link1 + ' finished processing - Links Left - ' + fetchProductInfo.length() + "\n");
          });
        });
      }
    });
    var stop = new Date().getTime();
    while (true) {
      if (new Date().getTime() > stop + 3500) {
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
  for(var i = 0 ; i < BaseUrl.length; i++){
    co(function*() {
      // console.log(BaseUrl[i]);
      fetchProductUrls.push(BaseUrl[i], function(err) {
        link++;
        console.log('Link - ' + link + ' finished processing - Links Left - ' + fetchProductUrls.length());
      });
    }).then(function(value) {});
  }
  console.log("After fetch urls");
};

console.log("started scraping !!!")
init();