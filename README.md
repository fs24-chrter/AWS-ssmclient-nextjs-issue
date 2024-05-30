This a sample project to demonstrate an issue getting AWS credentials in code which runs in Next.js Middleware.
I tried to isolate the issue as much as possible by using a simple Next.js bootstrap application.

## Bug description

If you run this code in a container in ECS, it is not able to fetch AWS credentials if the code runs in Next.js middleware (see `src/middleware.ts`). However, the exact same code runs fine when it runs in a normal Next.js page (see `src/app/layout.tsx`). 

From my understanding the issue comes from the fact that the `SSMClient` resolves to the `Node` config in the page layout and to `Browser` config in the middleware. However it should not as the middleware is also completely executed on the server side.

## How to deploy

Build a new docker image, push to AWS ECR and let it run in AWS ECS.

```
docker build -f Docker/Dockerfile -t taskrole-ssmclient .
docker tag taskrole-ssmclient <remote-ECR-image-name>
docker push <remote-ECR-image-name>
```

Give the task in ECS a taskrole with an inline policy to read from parameter store.
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "secretsmanager:DescribeSecret",
                "secretsmanager:GetSecretValue"
            ],
            "Resource": "arn:aws:secretsmanager:eu-central-1:<redacted>:secret:<redacted>",
            "Effect": "Allow"
        },
        {
            "Action": "ssm:GetParametersByPath",
            "Resource": "*",
            "Effect": "Allow"
        }
    ]
}
```

## How to run locally

To run locally execute the following

`docker run -e AWS_ACCESS_KEY_ID=<redacted> -e AWS_SECRET_ACCESS_KEY=<redacted> -p 8080:3000 taskrole-ssmclient`

and open [http://localhost:8080/something](http://localhost:8080/something). You will see a 404 but that's fine. It's just important that the Middleware as well as the Layout code will be executed.
