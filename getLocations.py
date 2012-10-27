from instagram.client import InstagramAPI
from datetime import datetime
import time

TWELVE_HOURS = 43200.0
CLIENT_ID = '5d112de8521e4a658a350b17c75b85bd'
CLIENT_SECRET = '5084aa9081e04ad097d4510e1e4e77d9'

api = InstagramAPI(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
popular_media = api.media_popular(count=20)

photos = []

#testing photo retrieval

# for media in popular_media:
# 	try:
# 	    photos.append('<img src="%s"/>' % media.images['thumbnail'].url)
# 	    print photos[len(photos)-1]
# 	except AttributeError:
# 		pass

#test location and time search in SF. This is kind of slow and only gets 1 result?
utc_current = time.mktime(datetime.now().timetuple())
utc_12back = utc_current - TWELVE_HOURS

media_by_location = api.media_search(q=10, count=10, lat=37.7272, lng=-123.0322, min_timestamp = utc_12back, max_timestamp=utc_current)

for media in media_by_location:
	try:
	    photos.append('<img src="%s"/>' % media.images['thumbnail'].url)
	    print photos[len(photos)-1]
	except AttributeError:
		pass