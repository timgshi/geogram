from instagram.client import InstagramAPI
import json

CLIENT_ID = '5d112de8521e4a658a350b17c75b85bd'
CLIENT_SECRET = '5084aa9081e04ad097d4510e1e4e77d9'

cities = {'San Francisco' :
							{'name' : 'San Francisco',
							 'lat' : 37.7831,
							 'lng' : -122.420,
							 'distance' : 5000},
		  'Los Angeles' : 	{'name' : 'Los Angeles',
		  					  'lat' : 34.102,
		  					  'lng' : -118.245,
		  					  'distance' : 5000}}

MEDIA_COUNT = 100

all_images = {}
all_cities = []

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
		try:
			image_dict['image-thumb'] = image.images['thumbnail'].url
			image_dict['image-large'] = image.images['standard_resolution'].url
			image_dict['timestamp'] = image.created_time.isoformat()
			image_dict['likes'] = len(image.likes)
			image_dict['comments'] = len(image.comments)
			tags = []
			for tag in image.tags:
				tags.append(tag.name)
			image_dict['tags'] = tags
		except AttributeError:
			pass
		city_list.append(image_dict)
	# all_images[city['name']] = city_list
	all_cities.append({city['name'] : city_list})
print json.dumps(all_cities, sort_keys=True, indent=2)
f = open('cityphotos.json', 'w')
f.write(json.dumps({'cities': all_cities}))
f.close()
