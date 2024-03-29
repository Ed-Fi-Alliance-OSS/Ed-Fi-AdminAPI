# SPDX-License-Identifier: Apache-2.0
# Licensed to the Ed-Fi Alliance under one or more agreements.
# The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
# See the LICENSE and NOTICES files in the project root for more information.

# First layer uses a dotnet/sdk image to build the Admin API from source code
# Second layer uses the dotnet/aspnet image to run the built code


FROM mcr.microsoft.com/dotnet/sdk:8.0.202-alpine3.19-amd64@sha256:4baa826eb916ba267b246c3f7f55e9e076121b0037dab78f7ae75ba70149805c AS build
WORKDIR /source

COPY Application/NuGet.Config EdFi.Ods.AdminApi/
COPY Application/EdFi.Ods.AdminApi EdFi.Ods.AdminApi/

WORKDIR /source/EdFi.Ods.AdminApi
RUN dotnet restore && dotnet build -c Release

FROM build AS publish
RUN dotnet publish -c Release /p:EnvironmentName=Production --no-build -o /app/EdFi.Ods.AdminApi

FROM mcr.microsoft.com/dotnet/aspnet:8.0.3-alpine3.19-amd64@sha256:a531d9d123928514405b9da9ff28a3aa81bd6f7d7d8cfb6207b66c007e7b3075 as base

RUN apk --no-cache add curl=~8 dos2unix=~7 bash=~5 gettext=~0 icu=~74 && \
    addgroup -S edfi && adduser -S edfi -G edfi

FROM base AS setup
LABEL maintainer="Ed-Fi Alliance, LLC and Contributors <techsupport@ed-fi.org>"

ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_HTTP_PORTS=80

COPY --chmod=500 Settings/dev/run.sh /app/run.sh
COPY Settings/dev/log4net.config /app/log4net.txt

WORKDIR /app
COPY --from=publish /app/EdFi.Ods.AdminApi .

RUN cp /app/log4net.txt /app/log4net.config && \
    dos2unix /app/*.json && \
    dos2unix /app/*.sh && \
    dos2unix /app/log4net.config && \
    chmod 500 /app/*.sh -- ** && \
    rm -f /app/log4net.txt && \
    rm -f /app/*.exe && \
    apk del dos2unix && \
    chown -R edfi /app

EXPOSE ${ASPNETCORE_HTTP_PORTS}
USER edfi

ENTRYPOINT ["/app/run.sh"]
