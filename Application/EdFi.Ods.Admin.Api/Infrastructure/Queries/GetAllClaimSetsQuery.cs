// SPDX-License-Identifier: Apache-2.0
// Licensed to the Ed-Fi Alliance under one or more agreements.
// The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
// See the LICENSE and NOTICES files in the project root for more information.

using EdFi.Security.DataAccess.Contexts;
using ClaimSet = EdFi.Ods.Admin.Api.Features.ClaimSets.ClaimSet;

namespace EdFi.Ods.Admin.Api.Infrastructure.Queries
{
    public interface IGetAllClaimSetsQuery
    {
        IReadOnlyList<ClaimSet> Execute();
    }

    public class GetAllClaimSetsQuery : IGetAllClaimSetsQuery
    {
        private readonly ISecurityContext _securityContext;

        public GetAllClaimSetsQuery(ISecurityContext securityContext)
        {
            _securityContext = securityContext;
        }

        public IReadOnlyList<ClaimSet> Execute()
        {
            return _securityContext.ClaimSets
                .Select(x => new ClaimSet
                {
                    Id = x.ClaimSetId,
                    Name = x.ClaimSetName
                })
                .Distinct()
                .OrderBy(x => x.Name)
                .ToList();
        }
    }
}
