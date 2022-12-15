// SPDX-License-Identifier: Apache-2.0
// Licensed to the Ed-Fi Alliance under one or more agreements.
// The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
// See the LICENSE and NOTICES files in the project root for more information.

using System.Linq;
using EdFi.SecurityCompatiblity53.DataAccess.Contexts;

namespace EdFi.Ods.AdminApp.Management.ClaimSetEditor
{
    public class DeleteResourceOnClaimSetCommand
    {
        private readonly ISecurityContext _context;

        public DeleteResourceOnClaimSetCommand(ISecurityContext context)
        {
            _context = context;
        }

        public void Execute(IDeleteResourceOnClaimSetModel model)
        {
            var resourceClaimsToRemove = _context.ClaimSetResourceClaims.Where(x =>
                x.ResourceClaim.ResourceClaimId == model.ResourceClaimId && x.ClaimSet.ClaimSetId == model.ClaimSetId).ToList();

            _context.ClaimSetResourceClaims.RemoveRange(resourceClaimsToRemove);
            _context.SaveChanges();
        }
    }

    public interface IDeleteResourceOnClaimSetModel
    {
        int ClaimSetId { get; }
        int ResourceClaimId { get; }
    }
}
