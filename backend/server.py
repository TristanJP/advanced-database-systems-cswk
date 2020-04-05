from flask import Flask, request, jsonify
from flask_cors import CORS
from bson import json_util

import pymongo
import json

from sanitiser import Sanitiser

# Create the flask server
app = Flask(__name__)
CORS(app)

# Helpers =================

"""
MongoDB returns bson which must be parsed with specific json
encoder (bson.json_util.default). This must then be re-encoded
with (flask.jsonify) to create a flask json response
"""
def bson_to_json_response(bson_data):
    # Create a JSON object from bson Cursor
    json_obj = json.loads(json.dumps(list(bson_data), default=json_util.default))
    # Encodes and adds Headers etc for flask json response
    json_data = jsonify(json_obj)
    return json_data

# Routes =================

# Get all types of crime in DB
@app.route('/all-crime-types')
def all_crime_types():
    crime_types = crimes_collection.distinct("crime_type", {})
    return bson_to_json_response(crime_types)

# Get all dates in DB
@app.route('/all-dates')
def all_dates():
    crime_types = crimes_collection.distinct("date", {})
    return bson_to_json_response(crime_types)

# Get all year months in DB
@app.route('/all-year-months')
def all_year_months():
    crime_types = crimes_collection.distinct("month", {})
    return bson_to_json_response(crime_types)

# Get all falls within locations in DB
@app.route('/all-falls-within-location')
def all_falls_within_location():
    crime_types = crimes_collection.distinct("falls_within", {})
    return bson_to_json_response(crime_types)


# Main route for crimes data
@app.route('/crimes')
def crimes():
    # Get sanitised query paramteres using Sanitiser and required_params
    parameters = sanitiser.get_sanitised_params(request.args)

    # If there are any errors with query parameters, return the error instead
    if "Invalid Request" in parameters:
        resp = jsonify(parameters)
        resp.status_code = 400
        return resp

    # Otherwise, create a query for MongoDB
    query = []

    # Add location query if all params present ("$geoNear" must be first)
    if all(location_parameter in parameters for location_parameter in ["longitude", "latitude", "distance"]):
        location_query = {
            "$geoNear": {
                "near": {
                    "type": "Point" ,
                    "coordinates": [
                        parameters["longitude"],
                        parameters["latitude"]
                    ]
                },
                "distanceField": "dist.calculated",
                "maxDistance": parameters["distance"]
                }
        }
        query.append(location_query)

    # Add date range query if two dates provided
    if "date1" in parameters and "date2" in parameters:
        ordered_dates = sorted([
            parameters["date1"],
            parameters["date2"]
        ])
        date_range_query = {
            "$match": {
                "date" : {
                    "$gte": ordered_dates[0],
                    "$lte": ordered_dates[1]
                }
            }
        }
        query.append(date_range_query)
    # Add single date query if only one date provided
    elif "date1" in parameters or "date2" in parameters:
        date_query = {
            "$match": {
                "date": parameters["date1" if "date1" in parameters else "date2"]
            }
        }
        query.append(date_query)

    # Add crime type query if crime type provided
    if "crime-type" in parameters:
        crime_type_query = [
            {
                "$match": {
                    "crime_type":  {
                        "$in": parameters["crime-type"]
                    }
                }
            }
        ]
        query.extend(crime_type_query)

    # If query contains options
    if "option" in parameters:
        # Add count query
        if parameters["option"][0] == "count":
            count_query = {
                "$count": "count"
            }
            query.append(count_query)
        # Add grouped by month query
        elif parameters["option"][0] == "grouped-month":
            grouped_month_query = {
                "$group": {
                    "_id": "$month",
                    "count": {"$sum": 1}
                }
            }
            query.append(grouped_month_query)
        # Add grouped by location query
        elif parameters["option"][0] == "grouped-location":
            grouped_location_query = [
                {
                    "$group": {
                        "_id": {"location": "$location", "crime-type": "$crime_type"},
                        "location_total": {"$sum": 1},
                        "street-name": {"$first": "$street_name"}
                    }
                },
                {
                    "$project": {
                        "location": "$_id.location",
                        "crime-type": "$_id.crime-type",
                        "count": { "$toString": "$location_total" },
                        "location_total": "$location_total",
                        "street-name": "$street-name",
                        "_id": 0

                    }
                },
                {
                    "$project": {
                        "crime-and-loc": {
                            "$concat": ["$crime-type", ": ", "$count"]
                        },
                        "location": 1,
                        "location_total": 1,
                        "street-name": 1
                    }
                },
                {
                    "$group": {
                        "_id": {"location": "$location", "street-name": "$street-name"},
                        "location_total": {"$sum": "$location_total"},
                        "crime-types": {
                            "$addToSet": "$crime-and-loc"
                        }
                    }
                }
            ]
            query.extend(grouped_location_query)
    # Add fields query if fields is in the parameters and no option has been set
    elif "fields" in parameters:
        fields = parameters["fields"]

        fields_query = {
            "$project": {
                "_id": 0
            }
        }
        # Iterate over the list of parameters and add them to the query
        for field in fields:
            fields_query["$project"][field] = 1

        query.append(fields_query)

    # Use Query on crimes collection
    bson_data = crimes_collection.aggregate(query)
    # Return the flask json response with returned data from MongoDB
    return bson_to_json_response(bson_data)

# RUN =================

if __name__ == '__main__':

    # Connect to Mongo DB adn get collection
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    police_db = client["police"]
    crimes_collection = police_db["crimes"]

    # Create a sanitiser object
    sanitiser = Sanitiser()

    # Run the backend server
    app.run(host='0.0.0.0', debug=True)