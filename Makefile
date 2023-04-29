build:
	docker build -t free-writer .

run:
	docker run -d -p 3000:3000 --name free-writer --rm free-writer