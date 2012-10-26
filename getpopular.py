from instagram.client import InstagramAPI

CLIENT_ID = '5d112de8521e4a658a350b17c75b85bd'
CLIENT_SECRET = '5084aa9081e04ad097d4510e1e4e77d9'

api = InstagramAPI(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
popular_media = api.media_popular(count=20)
for media in popular_media:
	try:
	    print media.location
	except AttributeError:
		pass