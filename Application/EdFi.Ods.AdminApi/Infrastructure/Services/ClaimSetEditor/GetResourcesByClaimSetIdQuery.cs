// SPDX-License-Identifier: Apache-2.0
// Licensed to the Ed-Fi Alliance under one or more agreements.
// The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
// See the LICENSE and NOTICES files in the project root for more information.

namespace EdFi.Ods.AdminApi.Infrastructure.ClaimSetEditor
{
    public class GetResourcesByClaimSetIdQuery : IGetResourcesByClaimSetIdQuery
    {
        private readonly IOdsSecurityModelVersionResolver _resolver;
        private readonly GetResourcesByClaimSetIdQueryV53Service _v53Service;
        private readonly GetResourcesByClaimSetIdQueryV6Service _v6Service;

        public GetResourcesByClaimSetIdQuery(IOdsSecurityModelVersionResolver resolver,
            GetResourcesByClaimSetIdQueryV53Service v53Service,
            GetResourcesByClaimSetIdQueryV6Service v6Service)
        {
            _resolver = resolver;
            _v53Service = v53Service;
            _v6Service = v6Service;
        }

        public IList<ResourceClaim> AllResources(int securityContextClaimSetId)
        {
            IList<ResourceClaim> parentResources;
            var securityModel = _resolver.DetermineSecurityModel();

            return securityModel switch {
                EdFiOdsSecurityModelCompatibility.ThreeThroughFive => ModelThreeThroughFive(),
                EdFiOdsSecurityModelCompatibility.FiveThreeCqe => ModelThreeThroughFive(true),
                EdFiOdsSecurityModelCompatibility.Six => ModelSix(),
                _ => throw new EdFiOdsSecurityModelCompatibilityException(securityModel)
            };

            IList<ResourceClaim> ModelThreeThroughFive(bool IsFiveThreeCqe = false) {
                parentResources = _v53Service.GetParentResources(securityContextClaimSetId, IsFiveThreeCqe);
                var childResources = _v53Service.GetChildResources(securityContextClaimSetId, IsFiveThreeCqe);
                _v53Service.AddChildResourcesToParents(childResources, parentResources);

                return parentResources;
            }

            IList<ResourceClaim> ModelSix() {
                parentResources = _v6Service.GetParentResources(securityContextClaimSetId);
                var childResources = _v6Service.GetChildResources(securityContextClaimSetId);
                GetResourcesByClaimSetIdQueryV6Service.AddChildResourcesToParents(childResources, parentResources);

                return parentResources;
            }
        }

        public ResourceClaim? SingleResource(int claimSetId, int resourceClaimId)
        {
            var parentResources = AllResources(claimSetId).ToList();
            var parentResourceClaim = parentResources
                .SingleOrDefault(x => x.Id == resourceClaimId);
            var childResources = new List<ResourceClaim>();
            if (parentResourceClaim == null)
            {
                foreach (var resourceClaims in parentResources.Select(x => x.Children)) childResources.AddRange(resourceClaims);
                return childResources.SingleOrDefault(x => x.Id == resourceClaimId);
            }

            return parentResourceClaim;
        }
    }

    public interface IGetResourcesByClaimSetIdQuery
    {
        IList<ResourceClaim> AllResources(int securityContextClaimSetId);
        ResourceClaim? SingleResource(int claimSetId, int resourceClaimId);
    }
}
