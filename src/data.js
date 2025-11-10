function getChanceOptions(){
    var chanceOptions = [
        "Free Ticket Booth Purple",
        "Free Ticket Booth Purple",
        "Free Ticket Booth Light Blue",
        "Free Ticket Booth Light Blue",
        "Free Ticket Booth Pink",
        "Free Ticket Booth Pink",
        "Free Ticket Booth Orange",
        "Free Ticket Booth Orange",
        "Free Ticket Booth Red",
        "Free Ticket Booth Red",
        "Free Ticket Booth Yellow",
        "Free Ticket Booth Yellow",
        "Free Ticket Booth Green",
        "Free Ticket Booth Green",
        "Free Ticket Booth Blue",
        "Free Ticket Booth Blue",
        "Take a ride on the Yellow Line and Roll Again",
        "Take a ride on the Green Line and Roll Again",
        "Take a ride on the Blue Line and Roll Again",
        "Take a ride on the Red Line and Roll Again",
        "Go to the Fireworks and Pay $2",
        "Go to the Water Show and Pay $2",
        "Go to the Fireworks and Pay $2",
        "Go to the Water Show and Pay $2"
    ];
    return internalShuffle(chanceOptions);
}

function internalShuffle(array){
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i (inclusive)
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements at indices i and j
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getAllTiles(){
    return [
        {
          "buyable": false,
          "description": "Collect $2 pocket money as you pass!",
          "houseAllowed": false,
          "id": "Start",
          "name": "START"
        },
        {
          "buyable": false,
          "description": "Pick a card!",
          "houseAllowed": false,
          "id": "Chance1",
          "name": "CHANCE"
        },
        {
          "baseRent": 1.0,
          "buyable": true,
          "color": "DARK_BLUE",
          "houseAllowed": true,
          "id": "Baloon Stand",
          "name": "Baloon Stand",
          "priceOrCharge": 1.0
        },
        {
          "baseRent": 1.0,
          "buyable": true,
          "color": "DARK_BLUE",
          "houseAllowed": true,
          "id": "Candy Floss",
          "name": "Candy Floss",
          "priceOrCharge": 1.0
        },
        {
          "buyable": false,
          "description": "Pick a card!",
          "houseAllowed": false,
          "id": "Chance2",
          "name": "CHANCE"
        },
        {
          "buyable": false,
          "description": "Roll Again!",
          "houseAllowed": false,
          "id": "Yellow1",
          "name": "Yellow Line Railway"
        },
        {
          "baseRent": 1.0,
          "buyable": true,
          "color": "SUBTLE_BLUE",
          "houseAllowed": true,
          "id": "Puppet Show",
          "name": "Puppet Show",
          "priceOrCharge": 2.0
        },
        {
          "baseRent": 1.0,
          "buyable": true,
          "color": "SUBTLE_BLUE",
          "houseAllowed": true,
          "id": "Magic Show",
          "name": "Magic Show",
          "priceOrCharge": 2.0
        },
        {
          "buyable": false,
          "description": "Pay $2 to see the Fireworks!",
          "houseAllowed": false,
          "id": "Fireworks1",
          "name": "Fireworks"
        },
        {
          "buyable": false,
          "description": "Pick a card!",
          "houseAllowed": false,
          "id": "Chance3",
          "name": "CHANCE"
        },
        {
          "buyable": false,
          "description": "Just hangout!",
          "houseAllowed": false,
          "id": "Cafe1",
          "name": "Café"
        },
        {
          "baseRent": 1.0,
          "buyable": true,
          "color": "PINK",
          "houseAllowed": true,
          "id": "Merry-go-Round",
          "name": "Merry-go-Round",
          "priceOrCharge": 2.0
        },
        {
          "baseRent": 1.0,
          "buyable": true,
          "color": "PINK",
          "houseAllowed": true,
          "id": "Paddle Boats",
          "name": "Paddle Boats",
          "priceOrCharge": 2.0
        },
        {
          "buyable": false,
          "description": "Roll Again!",
          "houseAllowed": false,
          "id": "Green1",
          "name": "Green Line Railway"
        },
        {
          "baseRent": 2.0,
          "buyable": true,
          "color": "ORANGE",
          "houseAllowed": true,
          "id": "Water Chute",
          "name": "Water Chute",
          "priceOrCharge": 3.0
        },
        {
          "baseRent": 2.0,
          "buyable": true,
          "color": "ORANGE",
          "houseAllowed": true,
          "id": "Mini Golf",
          "name": "Mini Golf",
          "priceOrCharge": 3.0
        },
        {
          "buyable": false,
          "description": "Collect shows and tram money!",
          "houseAllowed": false,
          "id": "Uncle Pennybag",
          "name": "Uncle Pennybag\u0027s Loose change"
        },
        {
          "buyable": false,
          "description": "Pick a card!",
          "houseAllowed": false,
          "id": "Chance4",
          "name": "CHANCE"
        },
        {
          "baseRent": 2.0,
          "buyable": true,
          "color": "RED",
          "houseAllowed": true,
          "id": "Video Arcade",
          "name": "Video Arcade",
          "priceOrCharge": 3.0
        },
        {
          "baseRent": 2.0,
          "buyable": true,
          "color": "RED",
          "houseAllowed": true,
          "id": "Haunted House",
          "name": "Haunted House",
          "priceOrCharge": 3.0
        },
        {
          "buyable": false,
          "description": "Pick a card!",
          "houseAllowed": false,
          "id": "Chance5",
          "name": "CHANCE"
        },
        {
          "buyable": false,
          "description": "Roll Again!",
          "houseAllowed": false,
          "id": "Blue1",
          "name": "Blue Line Railway"
        },
        {
          "baseRent": 3.0,
          "buyable": true,
          "color": "YELLOW",
          "houseAllowed": true,
          "id": "Helicopter Ride",
          "name": "Helicopter Ride",
          "priceOrCharge": 4.0
        },
        {
          "baseRent": 3.0,
          "buyable": true,
          "color": "YELLOW",
          "houseAllowed": true,
          "id": "Pony Ride",
          "name": "Pony Ride",
          "priceOrCharge": 4.0
        },
        {
          "buyable": false,
          "description": "Pay $2 to see the Water Show!",
          "houseAllowed": false,
          "id": "Water1",
          "name": "Water Show"
        },
        {
          "buyable": false,
          "description": "Pick a card!",
          "houseAllowed": false,
          "id": "Chance6",
          "name": "CHANCE"
        },
        {
          "buyable": false,
          "description": "Pay $3 to take the Tram to Café!",
          "houseAllowed": false,
          "id": "Tram1",
          "name": "Tram Station"
        },
        {
          "baseRent": 3.0,
          "buyable": true,
          "color": "GREEN",
          "houseAllowed": true,
          "id": "Dodgems",
          "name": "Dodgems",
          "priceOrCharge": 4.0
        },
        {
          "baseRent": 3.0,
          "buyable": true,
          "color": "GREEN",
          "houseAllowed": true,
          "id": "Big Wheel",
          "name": "Big Wheel",
          "priceOrCharge": 4.0
        },
        {
          "buyable": false,
          "description": "Roll Again!",
          "houseAllowed": false,
          "id": "Red1",
          "name": "Red Line Railway"
        },
        {
          "baseRent": 4.0,
          "buyable": true,
          "color": "BLUE",
          "houseAllowed": true,
          "id": "Loop the Loop",
          "name": "Loop the Loop",
          "priceOrCharge": 5.0
        },
        {
          "baseRent": 4.0,
          "buyable": true,
          "color": "BLUE",
          "houseAllowed": true,
          "id": "Roller Coaster",
          "name": "Roller Coaster",
          "priceOrCharge": 5.0
        }
      ];
}

export default {getChanceOptions, getAllTiles}