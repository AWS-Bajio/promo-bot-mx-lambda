# promo-bot-mx

Bot de Telegram y Twitter(próximamente) que revisa ofertas de videojuegos y tecnología publicadas en 
https://promodescuentos.com y las comparte públicamente

## Funciones

### GetHotPromos
Realiza una consulta a las primeras páginas de las categorías seleccionadas en la página de Promodescuentos para comparar si
estas ya existen en base de datos, en caso de que sean nuevas se realiza el envío de mensaje para que sea publicado con un bot de Telegram.
Esta función está programada para ejecutarse cada veinte minutos.

### DeleteHotPromos
Se encarga de realizar la limpieza de las ofertas viejas, cada día se realiza la ejecución de esta función para revisar aquellas
ofertas que lleven más de cinco días en la base de datos y eliminarlas.

## Configuración del proyecto
Para realizar modificaciones y probar el proyecto de manera local es necesario tener instalado el CLI de SAM 
(https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) y Docker
en nuestro equipo. 

### Base de datos local
En caso de que se desee hacer pruebas con una base de datos local, el proyecto cuenta con una imagen de DynamoDB local para su ejecución en Docker con configuración en el archivo 
_docker-compose.yml_. Si no se desea trabajar con una base de datos local, el proyecto ya cuenta con la instrucción para generar la base de datos como parte del stack de CloudFormation, por lo tanto, estos pasos no son necesarios.

```
version: '2'
services:
  dynamodb:
    container_name: dynamodb
    image: amazon/dynamodb-local:latest
    ports:
      - "8000:8000"
    command: -jar DynamoDBLocal.jar -sharedDb -dbPath /home/dynamodblocal/data/
    networks:
      - local-dev
    volumes:
      - ./data:/home/dynamodblocal/data
networks:
  local-dev:
    driver: bridge

``` 

De forma que para ejecutar la base de datos a nivel local solo se debe ejecutar el siguiente comando
desde la carpeta raíz del proyecto.

```
$ docker-compose up -d
``` 

Una vez levantada la base de datos, podemos generar la tabla del proyecto con el siguiente comando.

```
aws dynamodb --endpoint-url http://localhost:8000 create-table --table-name promo_bot_mx_promos --key-schema AttributeName=id,KeyType=HASH AttributeName=created_at,KeyType=RANGE --attribute-definitions AttributeName=id,AttributeType=S AttributeName=created_at,AttributeType=N  --billing-mode PAY_PER_REQUEST
```

### Archivos de entorno
Es posible generar diferentes entornos para la ejecución del proyecto, y esto se puede hacer generando archivos con extensión json.
En el caso de este proyecto, es necesario generar un _env.json_ en la raíz del proyecto (se puede tomar como ejemplo
el archivo env.example.json), y debe contar con una estructura como la siguiente:

```
    {
      "GetHotPromos": {
        "ENVIRONMENT": "dev",
        "ENDPOINT": "http://dynamodb:8000",
        "TELEGRAM_URL": "https:api.telegram.org/<API_KEY>:<API_SECRET>/sendMessage",
        "TELEGRAM_CHAT_ID": "-123456789123",
        "AWS_LOCAL_PROFILE": "default"
      },
      "DeleteHotPromos": {
        "ENVIRONMENT": "dev",
        "THRESHOLD_DAYS": 0,
        "ENDPOINT": "http://dynamodb:8000"
      }
    }
```

Lo ideal es generar un entorno por default con las configuraciones para la ejecución local. 

### Invocar funciones
La invocación de las funciones de manera local se puede realizar de la siguiente forma.
1. Se necesita generar un build del proyecto, esto se puede realizar con el comando

    ```
    $ sam build
    ```

2. Una vez generada la compilación de las funciones sin error, se puede probar cada función por separado utilizando el comando

    ```
   $ sam local invoke -n env.json --docker-network promo-bot-mx_local-dev <Nombre de la función>
   ```
   Ejemplo: para ejecutar una corrida local de la función GetHotPromos, es posible con el comando
   
   ```
   $ sam local invoke -n env.json --docker-network promo-bot-mx_local-dev GetHotPromos
   ```
   
   Si deseamos ejecutar la función con la configuración de producción, el comando solo debe ejecutarse como
   
   ```
   $ sam local invoke GetHotPromos
   ```

### Publicación 
Para publicar cambios en las funciones de producción es necesario generar un archivo _.env_ para proteger información sensible,
en este caso, vamos a generar un archivo con una estructura similar a:
```
TELEGRAM_URL=https://api.telegram.org/<API_KEY>:<API_SECRET>/sendMessage
TELEGRAM_CHAT_ID="-123456789123"
AWS_LOCAL_PROFILE=default 
```
Donde se reemplazarán los valores por los que coincidan con la cuenta de AWS correcta y el bot al que se apunte. Para finalizar, solo se debe ejecutar el comando

```
$ ./invoke.sh
```


