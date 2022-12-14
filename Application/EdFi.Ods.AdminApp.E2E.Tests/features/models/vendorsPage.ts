// SPDX-License-Identifier: Apache-2.0
// Licensed to the Ed-Fi Alliance under one or more agreements.
// The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
// See the LICENSE and NOTICES files in the project root for more information.

import { context, network } from "../management/setup";
import { AdminAppPage } from "./adminAppPage";

export class VendorsPage extends AdminAppPage {
    titleHeader = "div > h7";
    tableBody = "table#vendors-table tbody";
    helpSection = "#security-hint.collapse.in";
    activeTabSelector = "ul.nav-tabs li.active";
    fieldWithErrorSelector = ".row.has-error";
    vendorOnListSelector = `${this.tableBody} .tr-custom th`;
    deleteConfirmSelector = "div.alert:not(.hidden)";
    collapseSectionBtn = "#security-hint a#hide-security-hint-link";
    expandSectionBtn = "#show-security-hint-link a";
    addVendorBtn = 'button[data-target=".add-vendor-modal"]';
    editVendorBtn = "#vendors-table a.edit-vendor-link";
    deleteVendorBtn = "a.delete-vendor-link";
    defineAppBtn = "a.btn-primary:text('Define Applications')";
    saveChangesBtn = 'button[type="submit"]';
    errorMsgSection = "div.validationSummary";
    closeModalBtn = 'button[aria-label="Close"]';
    cancelBtn = "button.btn-default";

    get editedFormValueName(): string {
        return `${this.formValues.name} - Edited`;
    }

    get invalidContactEmail(): string {
        return this.formValues.contact;
    }

    get deleteVendorConfirmationMessage(): string {
        return `Are you sure you want to permanently delete vendor ${this.formValues.name}?`;
    }

    formFields = {
        name: {
            selector: 'input[name="Company"]',
            required: true,
        },
        namespacePrefix: {
            selector: 'textarea[name="NamespacePrefixes"]',
            required: false,
        },
        addNamespacePrefix: {
            selector: "input#add-namespace-prefix-input",
            required: false,
        },
        addNamespacePrefixBtn: {
            selector: "button#add-namespace-prefix",
            required: false,
        },
        contact: {
            selector: 'input[name="ContactName"]',
            required: true,
        },
        email: {
            selector: 'input[name="ContactEmailAddress"]',
            required: true,
        },
    };

    formValues = {
        name: "Automated Vendor",
        initialNamespacePrefix: "uri://ed-fi.org",
        addedNamespacePrefix: "uri://added.ed-fi.org",
        email: "test@test-ed-fi.org",
        contact: "Test Contact",
    };

    confirmationMessages = {
        added: "Vendor added successfully",
        edited: "Vendor updated successfully",
        deleted: "Vendor removed successfully",
    };

    errorMessages = {
        noData: "The highlighted fields are required to submit this form.",
        invalidEmail: "'Contact Email Address' is not a valid email address.",
    };

    modalTitleMessages = {
        addVendor: "Add Vendor",
        editVendor: "Edit Vendor",
        deleteVendor: "Delete Vendor",
    };

    path(): string {
        return `${this.url}/GlobalSettings/Vendors`;
    }

    async hasPageTitle(): Promise<boolean> {
        return await this.hasText({
            text: "Vendors",
            selector: this.titleHeader,
        });
    }

    async hasHelpSection(): Promise<boolean> {
        return await this.elementExists(this.helpSection);
    }

    async collapseHelpSection(): Promise<void> {
        await this.page.locator(this.collapseSectionBtn).click();
    }

    async hasTabSelected(): Promise<boolean> {
        return await this.hasText({
            text: "Vendors",
            selector: this.activeTabSelector,
        });
    }

    async hasHelpSectionFlag(): Promise<boolean> {
        return (
            (await context.storageState()).origins
                .find((o) => this.url.includes(o.origin))
                ?.localStorage?.find((l) => l.name === "HideSecurityHelpfulHint")?.value === "true"
        );
    }

    async showHelpSection(): Promise<void> {
        await this.page.locator(this.expandSectionBtn).click();
    }

    async addVendor(): Promise<void> {
        await this.page.locator(this.addVendorBtn).click();
    }

    async fillVendorForm(): Promise<void> {
        await this.fillVendorName();
        await this.fillNamespacePrefix();
        await this.fillContactName();
        await this.fillContactEmail();
    }

    async addNamespacePrefix(): Promise<void> {
        await this.modalSelector
            .locator(this.formFields.addNamespacePrefix.selector)
            .fill(this.formValues.addedNamespacePrefix);
        await this.modalSelector.locator(this.formFields.addNamespacePrefixBtn.selector).click();
    }

    async hasPrefixAdded(): Promise<boolean> {
        return (
            await this.modalSelector.locator(this.formFields.namespacePrefix.selector).inputValue()
        ).includes(this.formValues.addedNamespacePrefix);
    }

    async fillInvalidEmail() {
        await this.fillContactEmail(this.invalidContactEmail);
    }

    async saveVendorForm({ expectErrors = false }: { expectErrors?: boolean } = {}): Promise<void> {
        await Promise.all([
            network.waitForResponse({
                url: "/GlobalSettings/AddVendor",
                status: expectErrors ? 400 : 200,
            }),
            this.saveForm(),
        ]);
    }

    async saveEditedVendorForm(): Promise<void> {
        await Promise.all([
            network.waitForResponse({
                url: "/GlobalSettings/EditVendor",
            }),
            this.saveForm(),
        ]);
    }

    async isVendorPresentOnPage(): Promise<boolean> {
        return await this.hasText({ text: this.formValues.name, selector: this.vendorOnListSelector });
    }

    async isEditedVendorPresentOnPage(): Promise<boolean> {
        return this.hasText({ text: this.editedFormValueName, selector: this.vendorOnListSelector });
    }

    async noVendorsMessageVisible(): Promise<boolean> {
        return this.hasText({ text: "Added vendors will appear here" });
    }

    async clickDelete(): Promise<void> {
        await this.page.locator(this.deleteVendorBtn).first().click();
    }

    async deleteVendor(): Promise<void> {
        await Promise.all([
            this.clickConfirmDelete(),
            network.waitForResponse({ url: "GlobalSettings/DeleteVendor" }),
        ]);
    }

    async getDeleteVendorMessage(): Promise<string | null> {
        return await this.getText({ section: this.modalSelector, selector: this.deleteConfirmSelector });
    }

    async clickEdit(): Promise<void> {
        await this.page.locator(this.editVendorBtn).first().click();
    }

    async editVendorForm(): Promise<void> {
        await this.fillVendorName(this.editedFormValueName);
    }

    async defineApplicationsSingleInstance() {
        await Promise.all([this.clickDefineApplications(), this.page.waitForNavigation()]);
    }

    async getErrorMessages(): Promise<string | null> {
        return await this.getText({ section: this.modalSelector, selector: this.errorMsgSection });
    }

    async emailFieldHasError(): Promise<boolean> {
        return (
            this.modalSelector
                .locator(this.fieldWithErrorSelector)
                .locator(this.formFields.email.selector) !== undefined
        );
    }

    async requiredFieldsHaveError(): Promise<boolean> {
        let fieldsWithError = true;
        Object.values(this.formFields)
            .filter((field) => field.required)
            .flatMap((field) => field.selector)
            .forEach((value) => {
                fieldsWithError =
                    this.modalSelector.locator(this.fieldWithErrorSelector).locator(value) !== undefined;
            });
        return fieldsWithError;
    }

    async closeModal(): Promise<void> {
        await this.modalSelector.locator(this.closeModalBtn).click();
    }

    async clickCancel(): Promise<void> {
        await this.modalSelector.locator(this.cancelBtn).click();
    }

    async addVendorFullSteps(): Promise<void> {
        await this.navigate();
        await this.addVendor();
        await this.fillVendorForm();
        await this.saveVendorForm();
        if ((await this.getToastMessage()) !== this.confirmationMessages.added) {
            throw "confirmation of vendor added not found";
        }
        await this.isVendorPresentOnPage();
    }

    async deleteVendorFullSteps(): Promise<void> {
        await this.clickDelete();
        await this.deleteVendor();
    }

    private async clickConfirmDelete(): Promise<void> {
        await this.modalSelector.locator(this.saveChangesBtn).click();
    }

    private async clickDefineApplications(): Promise<void> {
        await this.page.locator(this.defineAppBtn).click();
    }

    private async fillVendorName(value = this.formValues.name): Promise<void> {
        await this.modalSelector.locator(this.formFields.name.selector).fill(value);
    }

    private async fillNamespacePrefix(): Promise<void> {
        await this.modalSelector
            .locator(this.formFields.namespacePrefix.selector)
            .fill(this.formValues.initialNamespacePrefix);
    }

    private async fillContactName(): Promise<void> {
        await this.modalSelector.locator(this.formFields.contact.selector).fill(this.formValues.contact);
    }

    private async fillContactEmail(value = this.formValues.email): Promise<void> {
        await this.modalSelector.locator(this.formFields.email.selector).fill(value);
    }

    private async saveForm(): Promise<void> {
        await this.modalSelector.locator(this.saveChangesBtn).click();
    }
}
