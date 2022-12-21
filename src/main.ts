import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { HttpExceptionFilter } from './filters/httpException.filter';

async function bootstrap() 
{
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);

  //Config
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin:  true,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  //Swagger
  const config = new DocumentBuilder()
    .setTitle("Tweeter API")
    .setDescription(`
      Documentation for the Tweeter social web application API.`)
    .setVersion(`1.0.0`)
    .setContact("Alexander Kovalyov",
      "https://github.com/endlesslydivided",
      "sashakovalev2002@hotmail.com")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/api/docs", app, document);
  
  
  await app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
}
bootstrap();
