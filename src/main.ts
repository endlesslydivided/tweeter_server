import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { VersioningType } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common/pipes';
import { ValidationExceptionFactory } from './validation/validation.exceptionFactory';
import { HttpExceptionFilter } from './exceptions/httpException.filter';

async function bootstrap() 
{
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);

  //Config
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe(
  { 
    transform: true,
    exceptionFactory: ValidationExceptionFactory
  }));
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  })
  
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
    console.log(`http://localhost:${PORT}/api`);
  });
}
bootstrap();
