// SPDX-License-Identifier: Apache-2.0
// Licensed to the Ed-Fi Alliance under one or more agreements.
// The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
// See the LICENSE and NOTICES files in the project root for more information.

using System.Threading.Tasks;
using EdFi.Ods.AdminApp.Management.Settings;

namespace EdFi.Ods.AdminApp.Management
{
    public interface IUpdateCloudOdsApiWebsiteSettingsCommand
    {
        Task Execute(CloudOdsApiOperationContext context, CloudOdsApiWebsiteSettings settings);
    }
}