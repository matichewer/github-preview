# Github Previews

Get github repositories previews.

## Deploys
- https://github-preview.onrender.com
- https://github-preview.chewer.net

## Usage
https://github-preview.onrender.com/ < git user > / < repo name > 


## Examples
Go to
```
https://github-preview.onrender.com/matichewer/PDF-Password-Remover
```
And you get something like this:
```
{
    "title":"GitHub - matichewer/PDF-Password-Remover: Elimina masivamente las contraseñas de archivos PDF.",
    "description":"Elimina masivamente las contraseñas de archivos PDF. - matichewer/PDF-Password-Remover", 
    "imageUrl":"https://opengraph.githubassets.com/56325fc290934e48aaa1b65d1ee7d4f904ef3aa46b3e0e5eec3607d09a6d3129/matichewer/PDF-Password-Remover"
}
```

## Run locally
### Download
```
git clone https://github.com/matichewer/github-preview
cd github-preview/
```
### Create a .env file with:
```
HOST_NAME=0.0.0.0
PORT=3000
```

### Start
#### With docker
```
docker compose up -d
```

#### With NPM
```
npm install
npm start
```

#### Example
http://localhost:3000/matichewer/PDF-Password-Remover

