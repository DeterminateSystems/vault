import { attr } from '@ember-data/model';
import { and } from '@ember/object/computed';
import { computed } from '@ember/object';
import Certificate from './pki-certificate';
import lazyCapabilities, { apiPath } from 'vault/macros/lazy-capabilities';

// TODO: alphabetize attrs
export default Certificate.extend({
  DISPLAY_FIELDS: computed(function() {
    return [
      'csr',
      'certificate',
      'commonName',
      'issueDate',
      'expiryDate',
      'issuingCa',
      'caChain',
      'privateKey',
      'privateKeyType',
      'serialNumber',
    ];
  }),
  addBasicConstraints: attr('boolean', {
    label: 'Add a Basic Constraints extension with CA: true',
    helpText:
      'Only needed as a workaround in some compatibility scenarios with Active Directory Certificate Services',
  }),
  backend: attr('string', {
    readOnly: true,
  }),
  caType: attr('string', {
    possibleValues: ['root', 'intermediate'],
    defaultValue: 'root',
    label: 'CA Type',
    readOnly: true,
  }),
  commonName: attr('string'),
  expiryDate: attr('string', {
    label: 'Expiration date',
  }),
  issueDate: attr('string'),
  pemBundle: attr('string', {
    label: 'PEM bundle',
    editType: 'file',
  }),
  uploadPemBundle: attr('boolean', {
    label: 'Upload PEM bundle',
    readOnly: true,
  }),
  fieldDefinition: computed('caType', 'uploadPemBundle', function() {
    const type = this.caType;
    const isUpload = this.uploadPemBundle;
    let groups = [{ default: ['caType', 'uploadPemBundle'] }];
    if (isUpload) {
      groups[0].default.push('pemBundle');
    } else {
      groups[0].default.push('type', 'commonName');
      if (type === 'root') {
        groups.push({
          Options: [
            'altNames',
            'ipSans',
            'ttl',
            'format',
            'privateKeyFormat',
            'keyType',
            'keyBits',
            'maxPathLength',
            'permittedDnsNames',
            'excludeCnFromSans',
            'ou',
            'organization',
            'otherSans',
          ],
        });
      }
      if (type === 'intermediate') {
        groups.push({
          Options: [
            'altNames',
            'ipSans',
            'format',
            'privateKeyFormat',
            'keyType',
            'keyBits',
            'excludeCnFromSans',
            'addBasicConstraints',
            'ou',
            'organization',
            'otherSans',
          ],
        });
      }
    }
    groups.push({
      'Address Options': ['country', 'locality', 'province', 'streetAddress', 'postalCode'],
    });

    return groups;
  }),
  type: attr('string', {
    possibleValues: ['internal', 'exported'],
    defaultValue: 'internal',
  }),
  ou: attr({
    label: 'OU (OrganizationalUnit)',
    editType: 'stringArray',
  }),
  organization: attr({
    editType: 'stringArray',
  }),
  country: attr({
    editType: 'stringArray',
  }),
  locality: attr({
    editType: 'stringArray',
    label: 'Locality/City',
  }),
  province: attr({
    editType: 'stringArray',
    label: 'Province/State',
  }),
  streetAddress: attr({
    editType: 'stringArray',
  }),
  postalCode: attr({
    editType: 'stringArray',
  }),

  keyType: attr('string', {
    possibleValues: ['rsa', 'ec'],
    defaultValue: 'rsa',
  }),
  keyBits: attr('number', {
    defaultValue: 2048,
  }),
  privateKeyFormat: attr('string', {
    possibleValues: ['', 'der', 'pem', 'pkcs8'],
    defaultValue: '',
  }),
  maxPathLength: attr('number', {
    defaultValue: -1,
  }),
  permittedDnsNames: attr('string', {
    label: 'Permitted DNS domains',
  }),

  csr: attr('string', {
    editType: 'textarea',
    label: 'CSR',
    masked: true,
  }),

  deletePath: lazyCapabilities(apiPath`${'backend'}/root`, 'backend'),
  canDeleteRoot: and('deletePath.canDelete', 'deletePath.canSudo'),
});
