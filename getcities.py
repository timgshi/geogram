from instagram.client import InstagramAPI
import json
import csv

CLIENT_ID = '5d112de8521e4a658a350b17c75b85bd'
CLIENT_SECRET = '5084aa9081e04ad097d4510e1e4e77d9'
MEDIA_COUNT = 10
MAX_CITIES = 10
counter = 0

# cities = {'San Francisco' :
# 							{'name' : 'San Francisco',
# 							 'lat' : 37.7831,
# 							 'lng' : -122.420,
# 							 'distance' : 5000},
# 		  'Los Angeles' : 	{'name' : 'Los Angeles',
# 		  					  'lat' : 34.102,
# 		  					  'lng' : -118.245,
# 		  					  'distance' : 5000}}

cities = {}
citiesDB = open('cities.csv', "rb")
reader = csv.reader(citiesDB)

for row in reader:
	city = {}
	city['name'] = row[0]
	city['lat'] = float(row[1])
	city['lng'] = float(row[2])
	city['distance'] = 5000
	cities[row[0]] = city

	#temp test value to limit number of cities from csv we process
	counter+=1
	if counter == MAX_CITIES:
		break
print cities
citiesDB.close()

all_cities = []
all_media = []

api = InstagramAPI(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
for cityName in cities:
	city = cities[cityName]
	media = api.media_search(count=MEDIA_COUNT, lat=city['lat'], lng=city['lng'], distance=city['distance'])
	city_list = []
	for image in media:
		image_dict = {}
		image_dict['image-thumb'] = ''
		image_dict['image-large'] = ''
		image_dict['timestamp'] = ''
		image_dict['likes'] = ''
		image_dict['comments'] = ''
		image_dict['tags'] = []
		image_dict['location'] = {}
		try:
			image_dict['image_thumb'] = image.images['thumbnail'].url
			image_dict['image_large'] = image.images['standard_resolution'].url
			image_dict['timestamp'] = image.created_time.isoformat()
			image_dict['likes'] = len(image.likes)
			image_dict['comments'] = len(image.comments)
			image_dict['location'] = {'lat' : image.location.point.latitude,
									  'lng' : image.location.point.longitude}
			tags = []
			for tag in image.tags:
				tags.append(tag.name)
			image_dict['tags'] = tags
		except AttributeError:
			pass
		city_list.append(image_dict)
		all_media.append(image_dict)
	# all_images[city['name']] = city_list
	all_cities.append({'media' : city_list,
					   'name' : cityName,
					   'location' : [{'lat' : city['lat'], 'lng' : city['lng']}]})
print json.dumps({'cities': all_cities}, sort_keys=True, indent=2)
f = open('cityphotos.json', 'w')
f.write(json.dumps({'cities': all_cities}))
f.close()
